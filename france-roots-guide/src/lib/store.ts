import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildingOrder, type BuildingId } from "./theme";

export interface OnboardingData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  country_moving_to: string;
  region: string;
  city: string;
  employment_status: string;
  is_job_seeking: boolean;
  has_income: boolean;
  income_bracket: string;
  currency: string;
  time_in_france: string;
  has_financial_ties_abroad: boolean;
  already_has: string[];
  goals: string[];
}

export interface Biberon {
  id: string;
  child_name: string;
  date_of_birth: string;
  goal: number;
  savings: number;
}

export interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  uploaded_at: string;
}

export interface UserBenefit {
  id: string;
  name: string;
  monthly_value: number;
  obtained_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface AppState {
  hasOnboarded: boolean;
  profileId: number | null;
  onboarding: Partial<OnboardingData>;
  completedBuildings: BuildingId[];
  buildingProgress: Record<string, string[]>;
  xp: number;
  streak: number;
  biberons: Biberon[];
  uploadedDocuments: UploadedDoc[];
  payslips: Record<string, { uploaded: boolean; net?: number }>;
  userBenefits: UserBenefit[];
  chatMessages: ChatMessage[];

  setOnboarding: (data: Partial<OnboardingData>) => void;
  setProfileId: (id: number) => void;
  completeOnboarding: () => void;
  completeBuilding: (id: BuildingId) => void;
  unlockBuildingChain: (id: BuildingId) => void;
  toggleStep: (buildingId: string, stepId: string) => void;
  addXp: (n: number) => void;
  addBiberon: (b: Omit<Biberon, "id" | "savings">) => void;
  addBiberonSavings: (id: string, amount: number) => void;
  addDocument: (doc: Omit<UploadedDoc, "id" | "uploaded_at">) => void;
  removeDocument: (id: string) => void;
  uploadPayslip: (month: string) => void;
  addBenefit: (b: Omit<UserBenefit, "id" | "obtained_at">) => void;
  removeBenefit: (id: string) => void;
  appendChat: (m: ChatMessage) => void;
  clearChat: () => void;
  reset: () => void;
}

const demoBiberons: Biberon[] = [
  { id: "demo-1", child_name: "Mia", date_of_birth: "2021-03-12", goal: 5000, savings: 1200 },
];

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      profileId: null,
      onboarding: {},
      completedBuildings: [],
      buildingProgress: {},
      xp: 0,
      streak: 0,
      biberons: demoBiberons,
      uploadedDocuments: [],
      payslips: {},
      userBenefits: [],
      chatMessages: [],

      setOnboarding: (data) => set((s) => ({ onboarding: { ...s.onboarding, ...data } })),
      setProfileId: (id) => set({ profileId: id }),
      completeOnboarding: () => set({ hasOnboarded: true, completedBuildings: ["airport"] }),
      completeBuilding: (id) =>
        set((s) =>
          s.completedBuildings.includes(id)
            ? s
            : { completedBuildings: [...s.completedBuildings, id], xp: s.xp + 100 }
        ),
      unlockBuildingChain: (id) =>
        set((s) => {
          const idx = buildingOrder.indexOf(id);
          if (idx <= 0) return s;
          const prereqs = buildingOrder.slice(0, idx);
          const merged = Array.from(new Set([...s.completedBuildings, ...prereqs]));
          return { completedBuildings: merged, xp: s.xp + 30 };
        }),
      toggleStep: (buildingId, stepId) =>
        set((s) => {
          const current = s.buildingProgress[buildingId] ?? [];
          const next = current.includes(stepId)
            ? current.filter((x) => x !== stepId)
            : [...current, stepId];
          return { buildingProgress: { ...s.buildingProgress, [buildingId]: next } };
        }),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      addBiberon: (b) =>
        set((s) => ({
          biberons: [...s.biberons, { ...b, id: crypto.randomUUID(), savings: 0 }],
        })),
      addBiberonSavings: (id, amount) =>
        set((s) => ({
          biberons: s.biberons.map((b) =>
            b.id === id ? { ...b, savings: b.savings + amount } : b
          ),
        })),
      addDocument: (doc) =>
        set((s) => ({
          uploadedDocuments: [
            ...s.uploadedDocuments,
            { ...doc, id: crypto.randomUUID(), uploaded_at: new Date().toISOString() },
          ],
        })),
      removeDocument: (id) =>
        set((s) => ({ uploadedDocuments: s.uploadedDocuments.filter((d) => d.id !== id) })),
      uploadPayslip: (month) =>
        set((s) => ({
          payslips: { ...s.payslips, [month]: { uploaded: true, net: 2300 + Math.floor(Math.random() * 400) } },
        })),
      addBenefit: (b) =>
        set((s) =>
          s.userBenefits.some((x) => x.name === b.name)
            ? s
            : {
                userBenefits: [
                  ...s.userBenefits,
                  { ...b, id: crypto.randomUUID(), obtained_at: new Date().toISOString() },
                ],
                xp: s.xp + 50,
              }
        ),
      removeBenefit: (id) =>
        set((s) => ({ userBenefits: s.userBenefits.filter((b) => b.id !== id) })),
      appendChat: (m) => set((s) => ({ chatMessages: [...s.chatMessages, m] })),
      clearChat: () => set({ chatMessages: [] }),
      reset: () =>
        set({
          hasOnboarded: false,
          profileId: null,
          onboarding: {},
          completedBuildings: [],
          buildingProgress: {},
          xp: 0,
          biberons: demoBiberons,
          uploadedDocuments: [],
          payslips: {},
          userBenefits: [],
          chatMessages: [],
        }),
    }),
    { name: "concierge-store" }
  )
);
