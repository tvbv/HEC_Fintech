import json
import os
from cerebras.cloud.sdk import Cerebras

INCOME_BRACKET_LABELS = {
    "under_10k": "under €10,000/year",
    "10k_to_30k": "€10,000–€30,000/year",
    "30k_to_60k": "€30,000–€60,000/year",
    "60k_to_100k": "€60,000–€100,000/year",
    "over_100k": "over €100,000/year",
}

EMPLOYMENT_LABELS = {
    "employed_fulltime": "employed full-time",
    "employed_parttime": "employed part-time",
    "freelance": "self-employed / freelance",
    "student": "a student",
    "between_jobs": "between jobs",
    "retired": "retired",
}

SYSTEM_PROMPT = """You are a financial and administrative advisor for expats and international students.
Given a user's personal situation, return a JSON object with exactly these 4 keys:
- banks: array of objects with keys: name, reason, url, account_type, tier
- tax_notes: array of objects with keys: topic, summary, urgency, action_required
- admin_checklist: array of objects with keys: task, category, deadline_hint, priority
- housing_notes: array of objects with keys: tip, category

Rules:
- Return ONLY valid JSON. No prose, no markdown, no code fences.
- banks: 3–5 recommendations relevant to the destination country
- tax_notes: 3–5 key tax considerations for this specific move
- admin_checklist: 5–8 practical tasks to complete on arrival
- housing_notes: 3–5 practical tips for finding housing in the destination country
- tier values: "top_pick", "recommended", "alternative"
- urgency values: "high", "medium", "low"
- priority values: "high", "medium", "low"
"""


def build_user_message(profile: dict) -> str:
    income_str = (
        f"an income of {INCOME_BRACKET_LABELS.get(profile['income_bracket'], profile['income_bracket'])} in {profile.get('currency', 'EUR')}"
        if profile["has_income"] and profile.get("income_bracket")
        else "no income currently"
    )
    employment_str = EMPLOYMENT_LABELS.get(profile["employment_status"], profile["employment_status"])

    return (
        f"User profile:\n"
        f"- Name: {profile['first_name']} {profile['last_name']}\n"
        f"- Date of birth: {profile['date_of_birth']}\n"
        f"- Nationality: {profile['nationality']}\n"
        f"- Currently living in: {profile['country_of_residence']}\n"
        f"- Moving to: {profile['country_moving_to']}\n"
        f"- Employment: {employment_str}\n"
        f"- Income: {income_str}\n"
    )


def get_recommendations(profile: dict) -> dict:
    client = Cerebras(api_key=os.environ["CEREBRAS_API_KEY"])

    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_message(profile)},
        ],
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    return json.loads(raw)
