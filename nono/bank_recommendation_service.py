# bank_recommendation_service.py
# Service de recommandation bancaire pour expatriés
# Python + FastAPI + Google Gemini

import json
import os
import time
import hashlib
from pathlib import Path

from cerebras.cloud.sdk import Cerebras
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# INITIALISATION GEMINI + FASTAPI
# ─────────────────────────────────────────────
cerebras_client = Cerebras(api_key=os.environ["CEREBRAS_API_KEY"])

app = FastAPI(title="Expat Bank Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# 1. CHARGEMENT DU CATALOGUE BANCAIRE
#    Lit banks.france.json une seule fois au démarrage
# ─────────────────────────────────────────────
CATALOG_PATH = Path(__file__).parent / "data" / "banks.france.json"

with open(CATALOG_PATH, encoding="utf-8") as f:
    BANK_CATALOG: list[dict] = json.load(f)

BANK_INDEX: dict[str, dict] = {bank["id"]: bank for bank in BANK_CATALOG}

print(f"✓ Catalogue chargé — {len(BANK_CATALOG)} banques")

# ─────────────────────────────────────────────
# 2. MODÈLES PYDANTIC
#    FastAPI les utilise pour valider automatiquement
#    le body des requêtes et générer la doc /docs
# ─────────────────────────────────────────────
class Document(BaseModel):
    data: str           # base64
    mime_type: str = "application/pdf"
    label: str = ""

class UserProfile(BaseModel):
    nationality: str | None = None
    has_french_address: bool = False
    visa_type: str | None = None
    income_range: str | None = None
    monthly_income_eur: float | None = None
    situation: str | None = None
    needs: list[str] = []
    languages: list[str] = []
    goals: list[str] = []

class RecommendRequest(BaseModel):
    profile: UserProfile
    documents: list[Document] = []

# ─────────────────────────────────────────────
# 3. SCHÉMA DE RÉPONSE JSON (Gemini Structured Output)
# ─────────────────────────────────────────────
RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id":      {"type": "string"},
                    "name":    {"type": "string"},
                    "score":   {"type": "number"},
                    "reasons": {"type": "array", "items": {"type": "string"}},
                    "url":     {"type": "string"},
                    "warning": {"type": "string", "nullable": True},
                    "tip":     {"type": "string", "nullable": True},
                },
                "required": ["id", "name", "score", "reasons", "url"],
            },
        },
        "profile_summary":  {"type": "string"},
        "missing_info":     {"type": "array", "items": {"type": "string"}},
        "combo_suggestion": {"type": "string", "nullable": True},
    },
    "required": ["recommendations", "profile_summary"],
}

# ─────────────────────────────────────────────
# 4. CONSTRUCTION DU PROMPT SYSTÈME
# ─────────────────────────────────────────────
def build_system_prompt() -> str:
    lines = []
    for b in BANK_CATALOG:
        req  = b["opening_requirements"]
        fees = b["fees"]

        monthly_note = f" ({fees['monthly_fee_note']})" if fees.get("monthly_fee_note") else ""
        income_note  = f"OUI (min {req.get('minimum_monthly_income_eur', '?')}€/mois)" if req.get("requires_proof_of_income") else "NON"
        multi        = f"OUI ({b['features']['supported_currencies']} devises)" if b["features"]["multi_currency"] else "NON"
        credit_types = ", ".join(b["features"].get("credit_types") or [])
        credit       = f"OUI ({credit_types})" if b["features"]["credit"] else "NON"

        lines.append(f"""### {b['name']} (id: "{b['id']}") — {b['type']}
- IBAN : {b['features']['iban_type']}
- Frais mensuels : {fees['monthly_fee_eur']}€{monthly_note}
- Adresse française requise : {"OUI" if req["requires_french_address"] else "NON"}
- Justificatif de revenus requis : {income_note}
- Multi-devises : {multi}
- Langues : {", ".join(b["languages_supported"])}
- Crédit disponible : {credit}
- Idéal pour : {", ".join(b["ideal_for"])}
- Points forts : {" | ".join(b["strengths"][:3])}
- Points faibles : {" | ".join(b["weaknesses"][:2])}
- Score expat de base : {b['expat_score']}/10""")

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


# ─────────────────────────────────────────────
# 5. CONVERSION DOCUMENTS → FORMAT GEMINI
# ─────────────────────────────────────────────
def build_document_parts(documents: list[Document]) -> list:
    parts = []
    for doc in documents:
        parts.append({
            "inline_data": {
                "mime_type": doc.mime_type,
                "data": doc.data,
            }
        })
        parts.append(
            f"Document ci-dessus : {doc.label or 'document sans titre'}. "
            "Extrais les informations pertinentes (revenus, statut, nationalité, etc.) "
            "pour affiner les recommandations."
        )
    return parts


# ─────────────────────────────────────────────
# 6. APPEL PRINCIPAL À L'API GEMINI
# ─────────────────────────────────────────────
def call_gemini(user_profile: UserProfile, documents: list[Document]) -> dict:
    system = build_system_prompt()

    doc_mention = " et les documents ci-dessous" if documents else ""
    user_text = (
        f"PROFIL DE L'EXPATRIÉ :\n"
        f"{json.dumps(user_profile.model_dump(), ensure_ascii=False, indent=2)}\n\n"
        f"Analyse ce profil{doc_mention}, puis retourne tes 3 meilleures recommandations "
        f"bancaires personnalisées en JSON strict respectant ce schéma :\n"
        f"{json.dumps(RESPONSE_SCHEMA, ensure_ascii=False)}\n\n"
        f"Réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks, sans explication."
    )

    response = cerebras_client.chat.completions.create(
        model="llama3.1-8b",  # ou "llama3.1-70b" selon dispo
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user_text},
        ],
        max_tokens=1500,
        temperature=0.3,
        response_format={"type": "json_object"},  # force le JSON
    )

    raw = response.choices[0].message.content.strip()
    parsed = json.loads(raw)

    # Enrichissement catalogue — inchangé
    for rec in parsed.get("recommendations", []):
        full_bank = BANK_INDEX.get(rec["id"])
        if full_bank:
            rec.update({
                "url":              full_bank["url"],
                "logo_url":         full_bank.get("logo_url"),
                "type":             full_bank["type"],
                "opening_time":     full_bank.get("opening_time"),
                "customer_support": full_bank.get("customer_support"),
                "features_summary": {
                    "iban_type":       full_bank["features"]["iban_type"],
                    "multi_currency":  full_bank["features"]["multi_currency"],
                    "credit":          full_bank["features"]["credit"],
                    "mobile_app":      full_bank["features"]["mobile_app"],
                    "monthly_fee_eur": full_bank["fees"]["monthly_fee_eur"],
                },
            })
    return parsed


# ─────────────────────────────────────────────
# 7. CACHE EN MÉMOIRE
# ─────────────────────────────────────────────
_cache: dict[str, dict] = {}
CACHE_TTL_SECONDS = 3600


def get_cache_key(profile: UserProfile) -> str:
    key_data = {
        "nationality":        profile.nationality,
        "has_french_address": profile.has_french_address,
        "visa_type":          profile.visa_type,
        "income_range":       profile.income_range,
        "needs":              sorted(profile.needs),
        "situation":          profile.situation,
    }
    return hashlib.md5(json.dumps(key_data, sort_keys=True).encode()).hexdigest()


def get_recommendations_with_cache(profile: UserProfile, documents: list[Document]) -> dict:
    if documents:
        return call_gemini(profile, documents)

    cache_key = get_cache_key(profile)
    cached = _cache.get(cache_key)

    if cached and (time.time() - cached["timestamp"]) < CACHE_TTL_SECONDS:
        print(f"[Cache HIT] {cache_key}")
        return {**cached["data"], "from_cache": True}

    result = call_gemini(profile, documents)
    _cache[cache_key] = {"data": result, "timestamp": time.time()}
    return result


# ─────────────────────────────────────────────
# 8. ROUTES FASTAPI
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")}


@app.post("/recommend/banks")
def recommend_banks(body: RecommendRequest):
    try:
        result = get_recommendations_with_cache(body.profile, body.documents)
        return {"success": True, "data": result}
    except Exception as e:
        print(f"[Erreur recommendation] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/banks")
def get_banks():
    return {"success": True, "data": BANK_CATALOG}


@app.get("/banks/{bank_id}")
def get_bank_by_id(bank_id: str):
    bank = BANK_INDEX.get(bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail=f"Banque '{bank_id}' introuvable.")
    return {"success": True, "data": bank}