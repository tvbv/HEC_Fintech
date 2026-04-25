# Supabase Integration Spec — Expat Onboarding MVP

Paste this into Lovable as context. It tells you exactly how to connect the intake form to Supabase.

---

## 1. Setup

Install the Supabase client:
```bash
npm install @supabase/supabase-js
```

Create `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Add to `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 2. Form State

Hold all form values in a single state object across pages:

```ts
type FormState = {
  // Page 1
  movingFrom: string        // ISO alpha-2 e.g. "FR"
  movingTo: string          // ISO alpha-2 e.g. "DE"
  // Page 2
  email: string
  // Page 3
  firstName: string
  lastName: string
  dob: string               // "YYYY-MM-DD"
  // Page 4
  nationality: string       // ISO alpha-2 e.g. "FR"
  // Page 5
  password: string
  // Step 1
  employmentStatus: string
  // Step 2
  hasIncome: boolean
  salaryBracket: string
  currency: string          // ISO 4217 e.g. "EUR"
}
```

Pages 1–4 only update local state. No Supabase calls yet.

---

## 3. Page 5 — Create account

When user clicks "Create account":

```ts
const { data, error } = await supabase.auth.signUp({
  email: formState.email,
  password: formState.password
})

if (error) {
  // show error message to user
  return
}

const userId = data.user!.id

// Immediately create the profile row
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .insert({
    user_id: userId,
    full_name: `${formState.firstName} ${formState.lastName}`,
    nationality: formState.nationality,
    date_of_birth: formState.dob,
    moving_from: formState.movingFrom,
    moving_to: formState.movingTo,
    moving_date: '2025-06-01',       // placeholder — not collected in MVP
    marital_status: 'single',         // placeholder — not collected in MVP
    stay_duration: '1_to_2_years',    // placeholder — not collected in MVP
    status: 'draft'
  })
  .select()
  .single()

// Save profile.id in state — you'll need it for later updates
const profileId = profile.id
```

---

## 4. Progress Step 1 — Employment status

When user clicks "Next" after selecting employment:

```ts
await supabase
  .from('profiles')
  .update({
    employment_types: [formState.employmentStatus]
  })
  .eq('id', profileId)
```

Employment status values to use:
| UI label | Value to store |
|---|---|
| Employed full-time | `"employed_fulltime"` |
| Employed part-time | `"employed_parttime"` |
| Self-employed / Freelance | `"freelance"` |
| Student | `"student"` |
| Between jobs | `"between_jobs"` |
| Retired | `"retired"` |

---

## 5. Progress Step 2 — Income (final submit)

When user clicks "Get my recommendations":

```ts
const salaryMap: Record<string, number> = {
  'under_10k':   5000,
  '10k_to_30k':  20000,
  '30k_to_60k':  45000,
  '60k_to_100k': 80000,
  'over_100k':   150000,
}

await supabase
  .from('profiles')
  .update({
    annual_salary_eur: formState.hasIncome ? salaryMap[formState.salaryBracket] : null,
    salary_currency: formState.currency,
    status: 'submitted'
  })
  .eq('id', profileId)

// Navigate to loading/recommendations page
```

Income bracket values to use:
| UI label | Value to store |
|---|---|
| Under €10,000 | `"under_10k"` |
| €10,000 – €30,000 | `"10k_to_30k"` |
| €30,000 – €60,000 | `"30k_to_60k"` |
| €60,000 – €100,000 | `"60k_to_100k"` |
| Over €100,000 | `"over_100k"` |

---

## 6. Country codes

All country fields use ISO 3166-1 alpha-2 (2-letter uppercase codes).

Use the `world-countries` npm package for the full searchable list:
```bash
npm install world-countries
```

Common examples:
| Country | Code |
|---|---|
| France | `FR` |
| Germany | `DE` |
| United Kingdom | `GB` |
| United States | `US` |
| Japan | `JP` |
| Spain | `ES` |
| Italy | `IT` |
| Netherlands | `NL` |
| Switzerland | `CH` |
| Canada | `CA` |
| Portugal | `PT` |
| Belgium | `BE` |

---

## 7. Reading the profile (for recommendations page)

```ts
const { data: { user } } = await supabase.auth.getUser()

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user!.id)
  .single()
```

---

## 8. Reading recommendations (once backend generates them)

```ts
const { data: recommendations } = await supabase
  .from('recommendations')
  .select('*')
  .eq('profile_id', profile.id)
  .order('generated_at', { ascending: false })
  .limit(1)
  .single()

// recommendations.banks        → array of bank suggestions
// recommendations.tax_notes    → array of tax items
// recommendations.admin_checklist → array of tasks
// recommendations.housing_notes  → array of tips
```

---

## 9. Checking if recommendations are ready

Poll every 2 seconds after submit until profile status is `"complete"`:

```ts
const pollForRecommendations = async (profileId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', profileId)
    .single()

  if (profile.status === 'complete') {
    // fetch and display recommendations
  } else {
    setTimeout(() => pollForRecommendations(profileId), 2000)
  }
}
```

---

## Table reference

| Table | Who writes | Who reads |
|---|---|---|
| `profiles` | Frontend (via anon key + RLS) | Frontend + Backend |
| `recommendations` | Backend only (service-role key) | Frontend (read-only via RLS) |
