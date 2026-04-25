"""Bank recommendation service using Cerebras AI."""

import hashlib
import json
import os
import time
from pathlib import Path

from cerebras.cloud.sdk import Cerebras
from fastapi import HTTPException
from models import Document, UserProfile

# ─────────────────────────────────────────────
# RESPONSE SCHEMA FOR STRUCTURED OUTPUT
# ─────────────────────────────────────────────
RESPONSE_SCHEMA = {
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


class BankService:
    """Service for bank recommendations and catalog management."""

    def __init__(self):
        """Initialize the bank service with Cerebras client and load catalog."""
        self.cerebras_client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))
        self.catalog = []
        self.index = {}
        self._cache = {}
        self.CACHE_TTL_SECONDS = 3600
        self.load_catalog()

    def load_catalog(self) -> None:
        """Load the bank catalog from JSON file."""
        # Path to banks.france.json in data directory
        catalog_path = Path(__file__).parent.parent / "data" / "banks.france.json"

        try:
            with open(catalog_path, encoding="utf-8") as f:
                self.catalog = json.load(f)
            self.index = {bank["id"]: bank for bank in self.catalog}
            print(f"✓ Catalogue chargé — {len(self.catalog)} banques")
        except FileNotFoundError:
            print(f"⚠️  Catalogue not found at {catalog_path}")
            self.catalog = []
            self.index = {}

    def build_system_prompt(self) -> str:
        """Build the system prompt for the Cerebras model."""
        lines = []
        for b in self.catalog:
            req = b["opening_requirements"]
            fees = b["fees"]

            monthly_note = (
                f" ({fees['monthly_fee_note']})" if fees.get("monthly_fee_note") else ""
            )
            income_note = (
                f"OUI (min {req.get('minimum_monthly_income_eur', '?')}€/mois)"
                if req.get("requires_proof_of_income")
                else "NON"
            )
            multi = (
                f"OUI ({b['features']['supported_currencies']} devises)"
                if b["features"]["multi_currency"]
                else "NON"
            )
            credit_types = ", ".join(b["features"].get("credit_types") or [])
            credit = f"OUI ({credit_types})" if b["features"]["credit"] else "NON"

            lines.append(
                f"""### {b["name"]} (id: "{b["id"]}") — {b["type"]}
- IBAN : {b["features"]["iban_type"]}
- Frais mensuels : {fees["monthly_fee_eur"]}€{monthly_note}
- Adresse française requise : {"OUI" if req["requires_french_address"] else "NON"}
- Justificatif de revenus requis : {income_note}
- Multi-devises : {multi}
- Langues : {", ".join(b["languages_supported"])}
- Crédit disponible : {credit}
- Idéal pour : {", ".join(b["ideal_for"])}
- Points forts : {" | ".join(b["strengths"][:3])}
- Points faibles : {" | ".join(b["weaknesses"][:2])}
- Score expat de base : {b["expat_score"]}/10"""
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

    def call_cerebras(
        self, user_profile: UserProfile, documents: list[Document]
    ) -> dict:
        """Call Cerebras API for bank recommendations."""
        system = self.build_system_prompt()

        doc_mention = " et les documents ci-dessous" if documents else ""
        user_text = (
            f"PROFIL DE L'EXPATRIÉ :\n"
            f"{json.dumps(user_profile.model_dump(), ensure_ascii=False, indent=2)}\n\n"
            f"Analyse ce profil{doc_mention}, puis retourne tes 3 meilleures recommandations "
            f"bancaires personnalisées en JSON strict respectant ce schéma :\n"
            f"{json.dumps(RESPONSE_SCHEMA, ensure_ascii=False)}\n\n"
            f"Réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks, sans explication."
        )

        try:
            response = self.cerebras_client.chat.completions.create(
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
            parsed = json.loads(raw)

            # Enrich recommendations with full bank data
            for rec in parsed.get("recommendations", []):
                full_bank = self.index.get(rec["id"])
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
                                "multi_currency": full_bank["features"][
                                    "multi_currency"
                                ],
                                "credit": full_bank["features"]["credit"],
                                "mobile_app": full_bank["features"]["mobile_app"],
                                "monthly_fee_eur": full_bank["fees"]["monthly_fee_eur"],
                            },
                        }
                    )

            return parsed
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cerebras API error: {str(e)}")

    def _get_cache_key(self, profile: UserProfile) -> str:
        """Generate cache key from user profile."""
        key_data = {
            "nationality": profile.nationality,
            "has_french_address": profile.has_french_address,
            "visa_type": profile.visa_type,
            "income_range": profile.income_range,
            "needs": sorted(profile.needs),
            "situation": profile.situation,
        }
        return hashlib.md5(json.dumps(key_data, sort_keys=True).encode()).hexdigest()

    def get_recommendations(
        self, profile: UserProfile, documents: list[Document] = None
    ) -> dict:
        """
        Get bank recommendations with optional caching.

        Args:
            profile: User profile for recommendations
            documents: Optional list of documents to analyze

        Returns:
            Dictionary with recommendations and analysis
        """
        if documents is None:
            documents = []

        # Skip cache if documents are provided
        if documents:
            return self.call_cerebras(profile, documents)

        # Check cache
        cache_key = self._get_cache_key(profile)
        cached = self._cache.get(cache_key)

        if cached and (time.time() - cached["timestamp"]) < self.CACHE_TTL_SECONDS:
            print(f"[Cache HIT] {cache_key}")
            return {**cached["data"], "from_cache": True}

        # Call API and cache result
        result = self.call_cerebras(profile, documents)
        self._cache[cache_key] = {"data": result, "timestamp": time.time()}
        return result

    def get_all_banks(self) -> list[dict]:
        """Get all banks from catalog."""
        return self.catalog

    def get_bank_by_id(self, bank_id: str) -> dict:
        """
        Get a specific bank by ID.

        Args:
            bank_id: The bank ID

        Returns:
            Bank data dictionary

        Raises:
            HTTPException: If bank not found
        """
        bank = self.index.get(bank_id)
        if not bank:
            raise HTTPException(status_code=404, detail=f"Bank '{bank_id}' not found")
        return bank


# Singleton instance
bank_service = BankService()
