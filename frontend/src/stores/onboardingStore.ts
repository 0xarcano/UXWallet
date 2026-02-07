import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorageAdapter } from './lib/asyncStorageAdapter';

export type OnboardingStep = 'connect' | 'delegate' | 'select-tokens' | 'unify' | 'complete';

interface OnboardingState {
  currentStep: OnboardingStep;
  hasCompletedOnboarding: boolean;
  setStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 'connect',
      hasCompletedOnboarding: false,
      setStep: (step: OnboardingStep) => set({ currentStep: step }),
      completeOnboarding: () => set({ currentStep: 'complete', hasCompletedOnboarding: true }),
      reset: () => set({ currentStep: 'connect', hasCompletedOnboarding: false }),
    }),
    {
      name: 'flywheel-onboarding',
      storage: createJSONStorage(() => asyncStorageAdapter),
      skipHydration: true,
    },
  ),
);
