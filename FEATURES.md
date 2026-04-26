# Expat Onboarding & Banking API — Feature Documentation

> Documentation complète pour Google AI Studio ou toute collaboration externe.  
> Backend : **FastAPI** · **Python 3.12** · **SQLite** · **Cerebras (llama3.1-8b)** · **Mistral OCR**  
> Déployé sur : **Google Cloud Run** (`europe-west1`)

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [API — Endpoints](#3-api--endpoints)
   - [GET /health](#31-get-health)
   - [POST /intake](#32-post-intake)
   - [GET /intake/{profile_id}](#33-get-intakeprofile_id)
   - [POST /documents](#34-post-documents)
   - [POST /banks/recommend](#35-post-banksrecommend)
   - [GET /banks](#36-get-banks)
   - [GET /banks/{bank_id}](#37-get-banksbank_id)
4. [Service — Extraction de documents](#4-service--extraction-de-documents)
5. [Service — Recommandations bancaires (Cerebras)](#5-service--recommandations-bancaires-cerebras)
6. [Service — Profil utilisateur](#6-service--profil-utilisateur)
7. [Base de données](#7-base-de-données)
8. [Catalogue bancaire](#8-catalogue-bancaire)
9. [Modèles Pydantic (contrats de données)](#9-modèles-pydantic-contrats-de-données)
10. [Variables d'environnement](#10-variables-denvironnement)
11. [Gestion des erreurs](#11-gestion-des-erreurs)
12. [Limitations connues](#12-limitations-connues)

---

## 1. Vue d'ensemble de l'architecture

```
Frontend (Lovable — React/Vite)
        │
        ├── POST /intake          → Sauvegarde le profil utilisateur
        ├── GET  /intake/{id}     → Récupère un profil par ID
        ├── POST /documents       → Upload d'un document (PDF / image / TXT)
        ├── POST /banks/recommend → Recommandations bancaires personnalisées
        ├── GET  /banks           → Liste tout le catalogue bancaire
        └── GET  /banks/{id}      → Détail d'une banque spécifique
                │
        FastAPI (Python 3.12)
                │
        ┌───────┴──────────────────────────────┐
        │                                      │
    SQLite (data.db)               ┌───────────┴──────────┐
    Table: profiles                │                      │
                               Cerebras API          Mistral API
                             (llama3.1-8b)         (OCR + chat)
                          ┌───────────────┐     ┌──────────────────┐
                          │ - PDF → texte │     │ - Image → OCR    │
                          │ - TXT direct  │     │   → extraction   │
                          │ - Reco banque │     └──────────────────┘
                          └───────────────┘
```

**Points clés :**
- Aucune authentification (pas de login, pas de token) — MVP/démo.
- CORS ouvert à `*` — tous les domaines peuvent appeler l'API.
- La base de données est un fichier SQLite local (`data.db`) dans le container → **données éphémères sur Cloud Run**.
- L'API est documentée automatiquement via Swagger UI : `/docs`.

---

## 2. Structure des fichiers

```
backend/
├── main.py                        ← Point d'entrée FastAPI, registration des routeurs
├── models.py                      ← Schémas Pydantic (validation entrée/sortie)
├── database.py                    ← SQLite + SQLAlchemy (tables, init, CRUD)
│
├── routes/
│   ├── health.py                  ← GET /health
│   ├── intake.py                  ← POST /intake, GET /intake/{id}
│   ├── document_upload.py         ← POST /documents
│   └── banks.py                   ← POST /banks/recommend, GET /banks, GET /banks/{id}
│
├── services/
│   ├── document_service.py        ← Logique d'extraction (PDF/image/TXT → JSON)
│   ├── bank_service.py            ← Logique de recommandation bancaire (Cerebras)
│   └── profile_service.py         ← Logique de gestion des profils (CRUD DB)
│
├── data/
│   └── banks.france.json          ← Catalogue statique de 10 banques (France)
│
├── Dockerfile                     ← Image Docker Python 3.12-slim, port 8080
├── requirements.txt               ← Dépendances Python
├── .env                           ← Clés API (non commité)
└── .env.example                   ← Template des variables d'environnement
```

---

## 3. API — Endpoints

### 3.1 `GET /health`

**But :** Liveness probe pour Cloud Run. Vérifie que le service répond.

**Requête :** aucun paramètre.

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2026-04-26T01:30:00Z"
}
```

---

### 3.2 `POST /intake`

**But :** Créer et sauvegarder le profil d'un utilisateur expat à partir du formulaire d'onboarding. Retourne l'identifiant du profil en base.

**Requête — body JSON :**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `country_of_residence` | `string` | ✅ | Code ISO 3166-1 alpha-2 du pays actuel (ex: `"FR"`) |
| `country_moving_to` | `string` | ✅ | Code ISO 3166-1 alpha-2 du pays de destination |
| `first_name` | `string` | ✅ | Prénom |
| `last_name` | `string` | ✅ | Nom de famille |
| `date_of_birth` | `string` | ✅ | Date de naissance format `YYYY-MM-DD` |
| `nationality` | `string` | ✅ | Code ISO 3166-1 alpha-2 de nationalité |
| `employment_status` | `string` | ✅ | Voir valeurs ci-dessous |
| `has_income` | `boolean` | ✅ | L'utilisateur a-t-il un revenu ? |
| `income_bracket` | `string` | ❌ | Requis si `has_income = true`. Voir valeurs ci-dessous |
| `currency` | `string` | ❌ | Code ISO 4217 (défaut `"EUR"`) |
| `goals` | `array[string]` | ❌ | Multi-sélection d'objectifs (voir valeurs ci-dessous) |

**Valeurs `employment_status` :**
| Valeur | Description |
|---|---|
| `"employed_fulltime"` | Salarié temps plein |
| `"employed_parttime"` | Salarié temps partiel |
| `"freelance"` | Indépendant / freelance |
| `"student"` | Étudiant |
| `"between_jobs"` | Entre deux emplois |
| `"retired"` | Retraité |

**Valeurs `income_bracket` :**
| Valeur | Description |
|---|---|
| `"under_10k"` | Moins de 10 000 €/an |
| `"10k_to_30k"` | 10 000 – 30 000 €/an |
| `"30k_to_60k"` | 30 000 – 60 000 €/an |
| `"60k_to_100k"` | 60 000 – 100 000 €/an |
| `"over_100k"` | Plus de 100 000 €/an |

**Valeurs `goals` :**
| Valeur | Description |
|---|---|
| `"banking"` | Ouvrir un compte bancaire |
| `"admin_setup"` | Démarches administratives |
| `"taxes"` | Comprendre les impôts |
| `"perks"` | Avantages et bons plans |

**Exemple de requête :**
```json
{
  "country_of_residence": "GB",
  "country_moving_to": "FR",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1992-07-15",
  "nationality": "GB",
  "employment_status": "employed_fulltime",
  "has_income": true,
  "income_bracket": "30k_to_60k",
  "currency": "EUR",
  "goals": ["banking", "taxes"]
}
```

**Réponse :**
```json
{
  "profile_id": 42
}
```

---

### 3.3 `GET /intake/{profile_id}`

**But :** Récupérer un profil utilisateur précédemment sauvegardé par son ID.

**Paramètre URL :** `profile_id` (entier)

**Réponse :**
```json
{
  "profile_id": 42,
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1992-07-15",
  "nationality": "GB",
  "country_of_residence": "GB",
  "country_moving_to": "FR",
  "employment_status": "employed_fulltime",
  "has_income": true,
  "income_bracket": "30k_to_60k",
  "currency": "EUR",
  "goals": ["banking", "taxes"],
  "created_at": "2026-04-26T01:30:00"
}
```

**Erreur si non trouvé :**
```json
{ "detail": "Profile not found" }
```
HTTP `404`.

---

### 3.4 `POST /documents`

**But :** Uploader un document (passeport, carte d'identité, PDF, fichier texte) pour en extraire automatiquement les champs personnels via IA. Retourne les champs extraits pour **pré-remplir le formulaire frontend**.

> ⚠️ Les données extraites sont retournées au frontend mais **ne sont pas persistées en base** dans cette branche.

**Requête :** `multipart/form-data` — champ `file`

**Types de fichiers acceptés :**
| Extension | Pipeline d'extraction |
|---|---|
| `.pdf` | pdfplumber → texte → Cerebras llama3.1-8b |
| `.txt` | texte direct → Cerebras llama3.1-8b |
| `.jpg` / `.jpeg` | Mistral OCR (`mistral-ocr-latest`) → Mistral chat (`mistral-small-latest`) |
| `.png` | Mistral OCR → Mistral chat |
| `.webp` | Mistral OCR → Mistral chat |

**Taille maximale :** 10 MB

**Réponse :**
```json
{
  "extracted": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1992-07-15",
    "nationality": "GB",
    "document_type": "passport"
  }
}
```

Tous les champs peuvent être `null` si l'IA n'a pas pu les identifier avec certitude.

**Valeurs `document_type` possibles :**
- `"passport"`
- `"id_card"`
- `"lease"` *(contrat de bail)*
- `"payslip"` *(fiche de paie)*
- `"bank_statement"` *(relevé bancaire)*
- `"other"`
- `null`

**Codes d'erreur :**
| Code HTTP | Cause |
|---|---|
| `400` | Fichier vide |
| `413` | Fichier trop large (> 10 MB) |
| `415` | Extension non supportée |
| `422` | PDF sans couche texte (PDF scanné) ou texte vide |
| `502` | Erreur API Cerebras / Mistral |
| `503` | Clé API non configurée |

---

### 3.5 `POST /banks/recommend`

**But :** Obtenir 3 recommandations bancaires personnalisées pour un expatrié s'installant en France, générées par Cerebras (`llama3.1-8b`) à partir du catalogue de 10 banques.

**Requête — body JSON :**

```json
{
  "profile": {
    "nationality": "JP",
    "has_french_address": false,
    "visa_type": "talent",
    "income_range": "30k_to_60k",
    "monthly_income_eur": 4000,
    "situation": "employed_fulltime",
    "needs": ["iban_fr", "international_transfers"],
    "languages": ["en", "fr"],
    "goals": ["banking"]
  },
  "documents": []
}
```

**Champs du profil :**
| Champ | Type | Description |
|---|---|---|
| `nationality` | `string` | Code ISO 3166-1 alpha-2 |
| `has_french_address` | `boolean` | Possède déjà une adresse en France |
| `visa_type` | `string` | Type de visa/titre de séjour (optionnel) |
| `income_range` | `string` | Tranche de revenus |
| `monthly_income_eur` | `float` | Revenu mensuel en euros (optionnel) |
| `situation` | `string` | Situation professionnelle |
| `needs` | `array[string]` | Besoins spécifiques (ex: `"iban_fr"`, `"international_transfers"`) |
| `languages` | `array[string]` | Langues parlées (codes ISO 639-1) |
| `goals` | `array[string]` | Objectifs de l'utilisateur |

**Champ `documents` (optionnel) :**  
Tableau de documents encodés en base64 (si fourni, le cache est désactivé) :
```json
{
  "data": "<base64_encoded_content>",
  "mime_type": "application/pdf",
  "label": "payslip"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "wise",
        "name": "Wise (ex-TransferWise)",
        "score": 9.2,
        "reasons": [
          "Pas d'adresse française requise pour l'ouverture",
          "Virements internationaux vers le Japon au meilleur taux"
        ],
        "url": "https://wise.com/fr",
        "logo_url": "https://wise.com/...",
        "type": "néobanque",
        "warning": "IBAN belge (BE) — certains employeurs français refusent la domiciliation de salaire",
        "tip": "Ouvre le compte depuis le Japon avant d'arriver en France",
        "opening_time": "10 minutes en ligne",
        "features_summary": {
          "iban_type": "BE (Belge)",
          "multi_currency": true,
          "credit": false,
          "mobile_app": true,
          "monthly_fee_eur": 0
        }
      }
    ],
    "profile_summary": "Japonais sans adresse française, revenu intermédiaire, besoin de virements internationaux.",
    "missing_info": ["visa_type non précisé"],
    "combo_suggestion": "Wise pour les virements + CIC pour l'IBAN FR dès l'arrivée"
  }
}
```

**Système de cache en mémoire :**  
Les résultats sont mis en cache (TTL 1 heure) par empreinte MD5 du profil (hors documents). Si le même profil est soumis dans l'heure, la réponse est retournée depuis le cache avec `"from_cache": true`.  
> Le cache est **en mémoire** (Python dict) → perdu au redémarrage du service.

---

### 3.6 `GET /banks`

**But :** Retourner le catalogue complet des 10 banques disponibles.

**Réponse :**
```json
{
  "success": true,
  "data": [
    { "id": "wise", "name": "Wise", ... },
    { "id": "n26", "name": "N26", ... },
    ...
  ]
}
```

---

### 3.7 `GET /banks/{bank_id}`

**But :** Retourner les données complètes d'une banque par son identifiant.

**Paramètre URL :** `bank_id` — identifiant de la banque (ex: `"wise"`, `"n26"`, `"revolut"`)

**Réponse :** objet complet de la banque (voir structure catalogue section 8).

**Erreur si non trouvée :**
```json
{ "detail": "Bank 'foo' not found" }
```
HTTP `404`.

---

## 4. Service — Extraction de documents

**Fichier :** `services/document_service.py`

### Pipeline PDF
1. Lecture des bytes du fichier
2. Validation : taille ≤ 10 MB, extension autorisée, contenu non vide
3. Extraction du texte page par page avec **pdfplumber**
4. Si aucun texte extrait → erreur `422` (PDF scanné → suggère d'uploader une image)
5. Troncature à **8 000 caractères max** si le texte est trop long (limite contexte LLM)
6. Appel **Cerebras** `llama3.1-8b` avec `temperature=0.1`, `max_tokens=300`
7. Parsing de la réponse JSON (avec gestion des markdown fences / prose parasite)
8. Validation et nettoyage des champs extraits

### Pipeline Image (JPG/PNG/WebP)
1. Validation taille + extension
2. Encodage en **base64**
3. Appel **Mistral OCR** (`mistral-ocr-latest`) → retourne du texte markdown avec le contenu reconnu
4. Concaténation du texte OCR de toutes les pages
5. Appel **Mistral chat** (`mistral-small-latest`) avec le texte OCR + prompt d'extraction
6. Parsing JSON + validation des champs

### Pipeline TXT
1. Décodage UTF-8 (erreurs ignorées)
2. Vérification que le texte n'est pas vide
3. Appel Cerebras directement

### Gestion des réponses LLM malformées
La fonction `_parse_llm_json()` tente :
1. Suppression des markdown code fences (` ```json ... ``` `)
2. `json.loads()` direct
3. Fallback : recherche du premier objet JSON `{...}` dans la chaîne avec regex
4. Si tout échoue → retourne un dict vide (tous les champs à `null`)

### Validation des champs extraits (`_validate_and_clean()`)
- `first_name`, `last_name`, `document_type` : doit être une string non vide
- `date_of_birth` : doit matcher `\d{4}-\d{2}-\d{2}` strictement
- `nationality` : doit matcher `[A-Za-z]{2}` → converti en majuscules
- Tout champ invalide → `null` (jamais d'erreur levée, toujours un dict complet)

---

## 5. Service — Recommandations bancaires (Cerebras)

**Fichier :** `services/bank_service.py`

### Initialisation
- Au démarrage, le service charge `data/banks.france.json` en mémoire
- Crée un index `{bank_id: bank_data}` pour accès O(1)
- Instancie le client Cerebras avec `CEREBRAS_API_KEY`

### Construction du prompt système (`build_system_prompt()`)
Le prompt est **dynamiquement généré** à partir du catalogue. Pour chaque banque, le LLM reçoit :
- Nom, type, ID
- Type d'IBAN
- Frais mensuels
- Adresse française requise (oui/non)
- Justificatif de revenus requis (oui/non + montant minimum)
- Multi-devises (oui/non + nombre de devises)
- Langues supportées
- Crédit disponible (oui/non + types)
- Profils idéaux
- Points forts/faibles (3 max chacun)
- Score expat de base (sur 10)

Le LLM est instruit de :
1. N'utiliser que les banques du catalogue (par `id` exact)
2. Personnaliser chaque recommandation selon le profil réel
3. Suivre des règles de priorité précises (primo-arrivant sans adresse → Wise/N26/Revolut/CIC en priorité, etc.)
4. Retourner un JSON strict (avec schéma fourni dans le prompt)
5. Suggérer une combinaison de 2 banques si pertinent
6. Inclure warnings et tips pratiques

### Réponse structurée
Cerebras est appelé avec `response_format={"type": "json_object"}` pour forcer une sortie JSON.  
Après parsing, chaque recommandation est **enrichie** avec les données complètes du catalogue (URL, logo, features_summary, etc.).

### Cache en mémoire
- Clé de cache = MD5 de `{nationality, has_french_address, visa_type, income_range, needs (sorted), situation}`
- TTL = **1 heure**
- Désactivé si des documents sont fournis
- Cache perdu au redémarrage du service

---

## 6. Service — Profil utilisateur

**Fichier :** `services/profile_service.py`

### `create_profile(profile_data: dict) → int`
- Sérialise `goals` (liste) en JSON string avant insertion
- Insère dans la table `profiles` via SQLAlchemy
- Retourne `profile.id`

### `get_profile(profile_id: int) → dict | None`
- Cherche dans la table `profiles` par ID
- Si trouvé, retourne un dict Python avec `goals` désérialisé (JSON string → liste)
- Si non trouvé, retourne `None`

---

## 7. Base de données

**Fichier :** `database.py`  
**Engine :** SQLite — fichier `./data.db` dans le répertoire de lancement  
**ORM :** SQLAlchemy 2.0

### Table `profiles`

| Colonne | Type SQL | Nullable | Description |
|---|---|---|---|
| `id` | INTEGER | NOT NULL | Clé primaire auto-incrémentée |
| `first_name` | STRING | NOT NULL | Prénom |
| `last_name` | STRING | NOT NULL | Nom de famille |
| `date_of_birth` | STRING | NOT NULL | Format `YYYY-MM-DD` |
| `nationality` | STRING(2) | NOT NULL | Code ISO pays, 2 caractères |
| `country_of_residence` | STRING(2) | NOT NULL | Code ISO pays actuel |
| `country_moving_to` | STRING(2) | NOT NULL | Code ISO pays de destination |
| `employment_status` | STRING | NOT NULL | Statut professionnel |
| `has_income` | BOOLEAN | NOT NULL | A un revenu |
| `income_bracket` | STRING | NULL | Tranche de revenu |
| `currency` | STRING(3) | NULL | Code ISO devise (ex: `EUR`) |
| `goals` | STRING | NULL | JSON stringifié (ex: `'["banking","taxes"]'`) |
| `created_at` | DATETIME | NULL | Timestamp UTC d'insertion (auto) |

> ⚠️ **Cloud Run — données éphémères** : `data.db` vit dans le container. Chaque nouveau déploiement ou redémarrage repart d'une base vide.

---

## 8. Catalogue bancaire

**Fichier :** `data/banks.france.json`  
**10 banques disponibles** (toutes pour la France) :

| ID | Nom | Type | IBAN | Score expat |
|---|---|---|---|---|
| `wise` | Wise (ex-TransferWise) | Néobanque | BE | 9/10 |
| `n26` | N26 | Néobanque | DE | 8/10 |
| `revolut` | Revolut | Néobanque | LT | 8/10 |
| `hello-bank` | Hello bank! (BNP Paribas) | Banque en ligne | FR | 7/10 |
| `boursorama` | Boursobank | Banque en ligne | FR | 7/10 |
| `bunq` | Bunq | Néobanque | NL/FR | 7/10 |
| `societe-generale-expat` | Société Générale (offre expat/étudiant) | Banque traditionnelle | FR | 7/10 |
| `hsbc-expat` | HSBC France (compte international) | Banque premium | FR | 8/10 |
| `orange-bank` | Orange Bank | Banque en ligne | FR | 5/10 |
| `cic-expat` | CIC (compte non-résident) | Banque traditionnelle | FR | 8/10 |

**Structure d'un objet banque :**
```json
{
  "id": "wise",
  "name": "Wise (ex-TransferWise)",
  "url": "https://wise.com/fr",
  "logo_url": "https://...",
  "type": "néobanque",
  "country_available": ["FR"],
  "languages_supported": ["fr", "en", "de", ...],
  "opening_requirements": {
    "requires_french_address": false,
    "requires_french_phone": false,
    "requires_proof_of_income": false,
    "requires_visa": false,
    "minimum_age": 18,
    "accepted_id_types": ["passeport", "carte_identite_EU", "titre_sejour"]
  },
  "fees": {
    "monthly_fee_eur": 0,
    "card_delivery_fee_eur": 9,
    "atm_withdrawal_free_limit_eur": 200,
    "atm_withdrawal_fee_above_limit_percent": 1.75,
    "international_transfer_fee": "0.35% à 2.85% selon devise",
    "fx_markup_percent": 0
  },
  "features": {
    "iban_type": "BE (Belge)",
    "multi_currency": true,
    "supported_currencies": 40,
    "debit_card": true,
    "virtual_card": true,
    "savings": false,
    "credit": false,
    "mobile_app": true,
    "apple_pay": true,
    "google_pay": true,
    "international_transfers": true,
    "direct_debit": true,
    "cheque": false
  },
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "..."],
  "ideal_for": ["..."],
  "not_recommended_for": ["..."],
  "expat_score": 9,
  "opening_time": "10 minutes en ligne",
  "customer_support": "Chat en ligne, email — pas de téléphone"
}
```

---

## 9. Modèles Pydantic (contrats de données)

**Fichier :** `models.py`

| Modèle | Utilisé par | Description |
|---|---|---|
| `IntakeRequest` | `POST /intake` | Profil utilisateur entrant |
| `IntakeResponse` | `POST /intake` | Réponse avec `profile_id` |
| `GetProfileResponse` | `GET /intake/{id}` | Profil complet retourné |
| `Document` | `POST /banks/recommend` | Document base64 pour analyse bancaire |
| `UserProfile` | `POST /banks/recommend` | Profil utilisateur pour recommandations |
| `RecommendRequest` | `POST /banks/recommend` | Wrapper `profile + documents` |
| `ExtractedDocument` | `POST /documents` | Champs extraits d'un document uploadé |
| `DocumentUploadResponse` | `POST /documents` | Wrapper `extracted` |

---

## 10. Variables d'environnement

| Variable | Requis | Usage |
|---|---|---|
| `CEREBRAS_API_KEY` | ✅ | Appels LLM pour extraction PDF/TXT et recommandations bancaires |
| `MISTRAL_API_KEY` | ✅ (si upload d'images) | OCR et extraction de champs pour images JPG/PNG/WebP |

Fichier template : `backend/.env.example`

---

## 11. Gestion des erreurs

### Codes HTTP utilisés

| Code | Signification | Déclenché par |
|---|---|---|
| `200` | Succès | Toutes les routes |
| `404` | Ressource non trouvée | `GET /intake/{id}`, `GET /banks/{id}` |
| `400` | Fichier vide | `POST /documents` |
| `413` | Fichier trop grand | `POST /documents` (> 10 MB) |
| `415` | Type de fichier non supporté | `POST /documents` |
| `422` | Contenu non extractable (PDF scanné) ou validation Pydantic | `POST /documents`, tous les endpoints |
| `500` | Erreur interne (base de données, LLM) | Toutes les routes |
| `502` | Erreur API externe (Cerebras/Mistral) | `POST /documents`, `POST /banks/recommend` |
| `503` | Clé API manquante | `POST /documents`, `POST /banks/recommend` |

### Robustesse du parsing LLM
- Réponse JSON avec markdown fences → nettoyage automatique
- Réponse partiellement valide → extraction du premier objet JSON trouvé
- Réponse complètement invalide → tous les champs à `null` (pas de crash)
- Champs extraits avec format incorrect → rejetés silencieusement à `null`

---

## 12. Limitations connues

| Limitation | Impact | Contexte |
|---|---|---|
| SQLite éphémère sur Cloud Run | Perte de données au redémarrage | Acceptable pour démo 1 jour |
| Cache en mémoire (BankService) | Perdu au redémarrage | Acceptable pour démo |
| PDF scannés (image-only) non supportés via `/documents` | L'utilisateur doit uploader une image | Workaround : uploader la photo directement |
| CORS ouvert à `*` | N'importe qui peut appeler l'API | Acceptable pour démo sans auth |
| `MISTRAL_API_KEY` non configurée sur Cloud Run prod | `POST /documents` avec image → HTTP 503 | À ajouter au déploiement si usage d'images |
| `goals` stocké comme JSON string en base | Nécessite désérialisation à la lecture | Géré dans `profile_service.py` |
| Double `return` dans `routes/health.py` ligne 13-14 | Code mort (bug mineur) | N'affecte pas le comportement |
| Double `return` dans `database.py` ligne 48-49 | Code mort (bug mineur) | N'affecte pas le comportement |
| Double instantiation singleton dans `profile_service.py` | Légère redondance | N'affecte pas le comportement |
