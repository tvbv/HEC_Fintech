import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingData {
  name: string;
  fromCountry: string;
  fromCountryFlag: string;
  toCountry: string;
  goals: string[];
  status: string;
  timeInFrance: string;
  hasHomeTies: boolean | null;
  documents: Record<string, boolean>;
}

export interface QuestState {
  bankSelected?: string;
  bankApplied?: boolean;
  bankActive?: boolean;
  taxesFiled?: boolean;
  benefitsClaimed?: boolean;
  benefitsApplied: string[];
}

interface AppState {
  onboarded: boolean;
  onboarding: OnboardingData;
  xp: number;
  streak: number;
  questsDone: number;
  level: number;
  quest: QuestState;
  profileId?: number;
  setOnboarding: (patch: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  toggleDocument: (key: string) => void;
  addXp: (amount: number) => void;
  setQuest: (patch: Partial<QuestState>) => void;
  setProfileId: (id: number) => void;
  reset: () => void;
}

const defaultOnboarding: OnboardingData = {
  name: "",
  fromCountry: "",
  fromCountryFlag: "",
  toCountry: "",
  goals: [],
  status: "",
  timeInFrance: "",
  hasHomeTies: null,
  documents: {
    bank: false,
    sim: false,
    address: false,
    secu: false,
    vitale: false,
    visa: false,
    fiscal: false,
    caf: false,
  },
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      onboarded: false,
      onboarding: defaultOnboarding,
      xp: 0,
      streak: 3,
      questsDone: 0,
      level: 1,
      quest: { benefitsApplied: [] },
      profileId: undefined,
      setOnboarding: (patch) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
      completeOnboarding: () => set({ onboarded: true }),
      toggleDocument: (key) =>
        set((s) => ({
          onboarding: {
            ...s.onboarding,
            documents: { ...s.onboarding.documents, [key]: !s.onboarding.documents[key] },
          },
        })),
      addXp: (amount) =>
        set((s) => ({ xp: s.xp + amount, questsDone: s.questsDone + 1 })),
      setQuest: (patch) => set((s) => ({ quest: { ...s.quest, ...patch } })),
      setProfileId: (id: number) => set({ profileId: id }),
      reset: () =>
        set({
          onboarded: false,
          onboarding: defaultOnboarding,
          xp: 0,
          streak: 3,
          questsDone: 0,
          level: 1,
          quest: { benefitsApplied: [] },
          profileId: undefined,
        }),
    }),
    { name: "concierge-state" },
  ),
);
