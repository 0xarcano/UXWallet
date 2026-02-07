import { useOnboardingStore } from '../onboardingStore';

describe('onboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      currentStep: 'connect',
      hasCompletedOnboarding: false,
    });
  });

  it('starts at connect step', () => {
    const state = useOnboardingStore.getState();
    expect(state.currentStep).toBe('connect');
    expect(state.hasCompletedOnboarding).toBe(false);
  });

  it('advances steps', () => {
    useOnboardingStore.getState().setStep('delegate');
    expect(useOnboardingStore.getState().currentStep).toBe('delegate');

    useOnboardingStore.getState().setStep('select-tokens');
    expect(useOnboardingStore.getState().currentStep).toBe('select-tokens');
  });

  it('completes onboarding', () => {
    useOnboardingStore.getState().completeOnboarding();
    const state = useOnboardingStore.getState();
    expect(state.currentStep).toBe('complete');
    expect(state.hasCompletedOnboarding).toBe(true);
  });

  it('resets to initial state', () => {
    useOnboardingStore.getState().completeOnboarding();
    useOnboardingStore.getState().reset();
    const state = useOnboardingStore.getState();
    expect(state.currentStep).toBe('connect');
    expect(state.hasCompletedOnboarding).toBe(false);
  });
});
