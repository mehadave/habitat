const STORAGE_KEY = 'habitat-onboarding-complete'

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function markOnboardingComplete() {
  localStorage.setItem(STORAGE_KEY, 'true')
}
