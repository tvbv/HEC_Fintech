"""
Bank recommendation service.

Loads a static JSON catalogue of banks and uses Cerebras (llama3.1-8b)
to generate personalised recommendations for expats moving to France.

Features:
- Dynamic system prompt built from catalogue data
- In-memory cache (TTL 1 hour) keyed on profile hash
- Cache is bypassed when documents are provided
- Full bank data merged into each recommendation after LLM response
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from pathlib import Path

from cerebras.cloud.sdk import Cerebras
from fastapi import HTTPException
from models import Document, UserProfile

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Response schema communicated to the LLM
# ---------------------------------------------------------------------------

RESPONSE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "score": {"type": "number"},
                    "reasons": {"type": "array", "items": {"type": "string"}},
                    "url": {"type": "string"},
                    "warning": {"type": "string", "nullable": True},
                    "tip": {"type": "string", "nullable": True},
                },
                "required": ["id", "name", "score", "reasons", "url"],
            },
        },
        "profile_summary": {"type": "string"},
        "missing_info": {"type": "array", "items": {"type": "string"}},
        "combo_suggestion": {"type": "string", "nullable": True},
    },
    "required": ["recommendations", "profile_summary"],
}

_CATALOG_PATH = Path(__file__).parent.parent / "data" / "banks.france.json"
_CACHE_TTL_SECONDS = 3600


class BankService:
    """Handles bank catalogue management and AI-powered recommendations."""

    def __init__(self) -> None:
        self._cerebras = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY", ""))
        self._catalog: list[dict] = []
        self._index: dict[str, dict] = {}
        self._cache: dict[str, dict] = {}
        self._load_catalog()

    # ------------------------------------------------------------------
    # Catalogue
    # ------------------------------------------------------------------

    def _load_catalog(self) -> None:
        """Load the bank catalogue from the JSON file at startup."""
        try:
            with open(_CATALOG_PATH, encoding="utf-8") as fh:
                self._catalog = json.load(fh)
            self._index = {bank["id"]: bank for bank in self._catalog}
            logger.info("Bank catalogue loaded — %d banks.", len(self._catalog))
        except FileNotFoundError:
            logger.warning("Bank catalogue not found at %s.", _CATALOG_PATH)

    def get_all_banks(self) -> list[dict]:
        """Return the full bank catalogue."""
        return self._catalog

    def get_bank_by_id(self, bank_id: str) -> dict:
        """
        Return a single bank's data by its ID.

        Raises:
            HTTPException 404: if the bank_id is not in the catalogue.
        """
        bank = self._index.get(bank_id)
        if not bank:
            raise HTTPException(status_code=404, detail=f"Bank '{bank_id}' not found.")
        return bank

    # ------------------------------------------------------------------
    # Recommendation
    # ------------------------------------------------------------------

    def get_recommendations(
        self,
        profile: UserProfile,
        documents: list[Document] | None = None,
    ) -> dict:
        """
        Return 3 personalised bank recommendations.

        Uses an in-memory cache (TTL 1 h) when no documents are provided.

        Args:
            profile:   Expat user profile.
            documents: Optional list of base64-encoded documents.

        Returns:
            Dict with 'recommendations', 'profile_summary', and optional
            'missing_info' / 'combo_suggestion' keys.
        """
        docs = documents or []

        if docs:
            return self._call_cerebras(profile, docs)

        cache_key = self._cache_key(profile)
        cached = self._cache.get(cache_key)
        if cached and (time.monotonic() - cached["ts"]) < _CACHE_TTL_SECONDS:
            logger.debug("Cache HIT for key %s.", cache_key)
            return {**cached["data"], "from_cache": True}

        result = self._call_cerebras(profile, docs)
        self._cache[cache_key] = {"data": result, "ts": time.monotonic()}
        return result

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _build_system_prompt(self) -> str:
        """Build the Cerebras system prompt dynamically from the catalogue."""
        lines: list[str] = []
        for bank in self._catalog:
            req = bank["opening_requirements"]
            fees = bank["fees"]
            monthly_note = (
                f" ({fees['monthly_fee_note']})" if fees.get("monthly_fee_note") else ""
            )
            income_note = (
                f"OUI (min {req.get('minimum_monthly_income_eur', '?')}€/mois)"
                if req.get("requires_proof_of_income")
                else "NON"
            )
            multi = (
                f"OUI ({bank['features']['supported_currencies']} devises)"
                if bank["features"]["multi_currency"]
                else "NON"
            )
            credit_types = ", ".join(bank["features"].get("credit_types") or [])
            credit = f"OUI ({credit_types})" if bank["features"]["credit"] else "NON"

            lines.append(
                f"""### {bank["name"]} (id: "{bank["id"]}") — {bank["type"]}
- IBAN : {bank["features"]["iban_type"]}
- Frais mensuels : {fees["monthly_fee_eur"]}€{monthly_note}
- Adresse française requise : {"OUI" if req["requires_french_address"] else "NON"}
- Justificatif de revenus requis : {income_note}
- Multi-devises : {multi}
- Langues : {", ".join(bank["languages_supported"])}
- Crédit disponible : {credit}
- Idéal pour : {", ".join(bank["ideal_for"])}
- Points forts : {" | ".join(bank["strengths"][:3])}
- Points faibles : {" | ".join(bank["weaknesses"][:2])}
- Score expat de base : {bank["expat_score"]}/10"""
            )

        bank_list = "\n\n".join(lines)
        return f"""Tu es un conseiller financier expert en banques pour expatriés s'installant en France.

Voici le catalogue complet des banques disponibles :

{bank_list}

---

TA MISSION :
Analyser le profil de l'utilisateur et recommander les 3 banques les plus adaptées à sa situation.

RÈGLES STRICTES :
1. Utilise UNIQUEMENT les banques du catalogue ci-dessus (champ "id" exact).
2. Personnalise chaque recommandation selon le profil réel — pas de réponse générique.
3. Tiens compte de ces priorités dans cet ordre :
   a. Si l'utilisateur n'a PAS encore d'adresse française → privilégie Wise, N26, Revolut, CIC (ouverture sans adresse)
   b. Si l'utilisateur a besoin d'un IBAN FR76 (domiciliation salaire) → Hello bank!, Boursobank, Bunq, SG, CIC
   c. Si l'utilisateur fait des virements internationaux fréquents → Wise ou Revolut en priorité
   d. Si l'utilisateur a des revenus > 5000€/mois → HSBC peut être pertinent
   e. Si l'utilisateur est étudiant → SG offre expat étudiant, N26 gratuit
4. Tu peux suggérer une combinaison de 2 banques si c'est la meilleure solution (ex: Wise + Hello bank!)
5. Chaque raison doit être concrète et liée au profil fourni, pas une description générique de la banque.
6. Mentionne les warnings importants (ex: IBAN non-FR refusé par certains employeurs).
7. Ajoute un tip pratique si tu en as un (ex: "Ouvre le compte CIC depuis ton pays d'origine avant d'arriver")."""

    def _call_cerebras(
        self, profile: UserProfile, documents: list[Document]
    ) -> dict:
        """
        Call the Cerebras API and return parsed + enriched recommendations.

        Raises:
            HTTPException 500: on any Cerebras API or JSON parsing error.
        """
        system = self._build_system_prompt()
        doc_mention = " et les documents ci-dessous" if documents else ""
        user_text = (
            f"PROFIL DE L'EXPATRIÉ :\n"
            f"{json.dumps(profile.model_dump(), ensure_ascii=False, indent=2)}\n\n"
            f"Analyse ce profil{doc_mention}, puis retourne tes 3 meilleures recommandations "
            f"bancaires personnalisées en JSON strict respectant ce schéma :\n"
            f"{json.dumps(RESPONSE_SCHEMA, ensure_ascii=False)}\n\n"
            f"Réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks, sans explication."
        )

        try:
            response = self._cerebras.chat.completions.create(
                model="llama3.1-8b",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_text},
                ],
                max_tokens=1500,
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content.strip()
            parsed: dict = json.loads(raw)
        except Exception:
            logger.error("Cerebras API call failed.", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Bank recommendation service is unavailable."
            )

        for rec in parsed.get("recommendations", []):
            full_bank = self._index.get(rec.get("id", ""))
            if full_bank:
                rec.update(
                    {
                        "url": full_bank["url"],
                        "logo_url": full_bank.get("logo_url"),
                        "type": full_bank["type"],
                        "opening_time": full_bank.get("opening_time"),
                        "customer_support": full_bank.get("customer_support"),
                        "features_summary": {
                            "iban_type": full_bank["features"]["iban_type"],
                            "multi_currency": full_bank["features"]["multi_currency"],
                            "credit": full_bank["features"]["credit"],
                            "mobile_app": full_bank["features"]["mobile_app"],
                            "monthly_fee_eur": full_bank["fees"]["monthly_fee_eur"],
                        },
                    }
                )

        return parsed

    @staticmethod
    def _cache_key(profile: UserProfile) -> str:
        """Generate a stable MD5 cache key from the profile's relevant fields."""
        key_data = {
            "nationality": profile.nationality,
            "has_french_address": profile.has_french_address,
            "visa_type": profile.visa_type,
            "income_range": profile.income_range,
            "needs": sorted(profile.needs),
            "situation": profile.situation,
        }
        return hashlib.md5(
            json.dumps(key_data, sort_keys=True).encode()
        ).hexdigest()


# Module-level singleton
bank_service = BankService()
