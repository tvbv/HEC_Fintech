// API base URL - adjust based on your backend location
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface IntakeRequest {
  country_of_residence: string;
  country_moving_to: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // "YYYY-MM-DD"
  nationality: string;
  employment_status: string;
  has_income: boolean;
  income_bracket?: string;
  currency?: string;
  goals?: string[];
}

export async function submitIntake(data: IntakeRequest): Promise<{ profile_id: number }> {
  const response = await fetch(`${API_BASE}/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Intake submission failed: ${response.statusText}`);
  }

  return response.json();
}
