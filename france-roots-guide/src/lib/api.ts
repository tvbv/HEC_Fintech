// API base URL — set VITE_API_URL in .env for production
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Intake
// ---------------------------------------------------------------------------

export interface IntakeRequest {
  // Identity
  first_name: string;
  last_name: string;
  date_of_birth: string;          // "YYYY-MM-DD"
  nationality: string;

  // Origin & destination
  country_of_residence: string;
  country_moving_to: string;

  // Situation
  employment_status: string;
  has_income: boolean;
  income_bracket?: string;
  currency?: string;

  // Destination context
  time_at_destination?: string;   // "just_arrived" | "settling_in" | "established"
  has_financial_ties_abroad?: boolean;
  already_has?: string[];         // e.g. ["local_bank_account", "local_phone"]

  // Goals
  goals?: string[];
}

export async function submitIntake(data: IntakeRequest): Promise<{ profile_id: number }> {
  const response = await fetch(`${API_BASE}/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Intake submission failed: ${response.statusText}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Chat / concierge
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChat(
  profile_id: number,
  message: string,
  history: ChatMessage[],
): Promise<{ reply: string }> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id, message, history }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.statusText}`);
  }

  return response.json();
}
