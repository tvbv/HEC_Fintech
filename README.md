# HEC Fintech Hackathon — Expat Onboarding App

An app that helps expats and international students onboard in a new country. Users fill a short intake form and receive AI-generated recommendations for banking, tax, admin tasks, and housing.

---

## Team responsibilities

| Person | Role |
|---|---|
| Junko | Backend (FastAPI + Cerebras) |
| Viktoria | Frontend (Lovable — React/Vite) |

---

## Architecture

```
Lovable Frontend (React/Vite)
        ↓
POST /intake  →  FastAPI on Google Cloud Run
                        ↓
                 Save to SQLite DB
                        ↓
                 Call Cerebras API (llama3.1-8b)
                        ↓
                 Return recommendations JSON
```

No auth, no login for MVP. One API call, one response.

---

## Intake form — questions (MVP only)

| Page | Question | UI type |
|---|---|---|
| 1 | Where do you currently live? + Where are you moving to? | Two searchable country dropdowns |
| 2 | First name, last name, date of birth | Text inputs + date picker |
| 3 | Which country are you a citizen of? | Searchable country dropdown |
| — | Progress bar starts (Step X of 2) | — |
| Step 1 | What best describes your employment status? | Clickable cards |
| Step 2 | Do you have an income? If yes, how much? | Yes/No toggle + bracket dropdown + currency |

---

## API contract

**Endpoint:** `POST /intake`

**Request body (what Viktoria sends):**
```json
{
  "country_of_residence": "FR",
  "country_moving_to": "DE",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1995-03-15",
  "nationality": "FR",
  "employment_status": "employed_fulltime",
  "has_income": true,
  "income_bracket": "30k_to_60k",
  "currency": "EUR"
}
```

**Response (what Viktoria gets back):**
```json
{
  "profile_id": 1,
  "banks": [
    { "name": "N26", "reason": "...", "url": "https://n26.com", "account_type": "current", "tier": "top_pick" }
  ],
  "tax_notes": [
    { "topic": "Tax Residency", "summary": "...", "urgency": "high", "action_required": "..." }
  ],
  "admin_checklist": [
    { "task": "Register with local authorities", "category": "admin", "deadline_hint": "Within 3 days", "priority": "high" }
  ],
  "housing_notes": [
    { "tip": "Use ImmobilienScout24 to find apartments", "category": "Online Platforms" }
  ]
}
```

**Employment status values:**
| UI label | Value to send |
|---|---|
| Employed full-time | `"employed_fulltime"` |
| Employed part-time | `"employed_parttime"` |
| Self-employed / Freelance | `"freelance"` |
| Student | `"student"` |
| Between jobs | `"between_jobs"` |
| Retired | `"retired"` |

**Income bracket values:**
| UI label | Value to send |
|---|---|
| Under €10,000 | `"under_10k"` |
| €10,000 – €30,000 | `"10k_to_30k"` |
| €30,000 – €60,000 | `"30k_to_60k"` |
| €60,000 – €100,000 | `"60k_to_100k"` |
| Over €100,000 | `"over_100k"` |

**Country fields:** ISO 3166-1 alpha-2 codes (`"FR"`, `"DE"`, `"GB"`, `"US"`, etc.)

---

## Running the backend locally

```bash
cd backend
cp .env.example .env        # add your CEREBRAS_API_KEY
source venv/bin/activate
uvicorn main:app --reload
```

- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## Backend file structure

```
backend/
  main.py          ← FastAPI app, POST /intake + GET /health
  models.py        ← Pydantic request/response schemas
  database.py      ← SQLite setup, saves every profile submission
  llm.py           ← Builds prompt + calls Cerebras API
  .env.example     ← Copy to .env, add CEREBRAS_API_KEY
  Dockerfile       ← Ready for Google Cloud Run
  requirements.txt
```

---

## Deployment (Google Cloud Run)

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/expat-backend ./backend
gcloud run deploy expat-backend \
  --image gcr.io/PROJECT_ID/expat-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars CEREBRAS_API_KEY=your-key
```

Once deployed, share the Cloud Run URL with Viktoria — she replaces `localhost:8000` with it.

---

## Status

**Done:**
- FastAPI backend with `/intake` endpoint
- SQLite database saving every profile submission
- Cerebras integration returning real recommendations
- Pushed to GitHub

**To do:**
- [ ] Deploy to Google Cloud Run (Junko)
- [ ] Build multi-step form in Lovable (Viktoria)
- [ ] Wire submit button to `POST /intake` (Viktoria)
- [ ] Build recommendations display page (Viktoria)
- [ ] End-to-end test together
