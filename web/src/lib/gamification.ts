export const LEVEL_NAMES: Record<number, string> = {
  1: 'Ripple',
  2: 'Wave',
  3: 'Current',
  4: 'Swell',
  5: 'Tide',
  6: 'Deep Dive',
  7: 'Deep Dive',
  8: 'Navigator',
  9: 'Navigator',
}

export function getLevelName(level: number): string {
  if (level >= 10) return 'Pod Leader'
  return LEVEL_NAMES[level] || 'Pod Leader'
}

export function getXPForLevel(level: number): number {
  return level * 100
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1
  let xpNeeded = 100
  let accumulated = 0
  while (accumulated + xpNeeded <= totalXP) {
    accumulated += xpNeeded
    level++
    xpNeeded = level * 100
  }
  return level
}

export function getXPProgressInLevel(totalXP: number): { current: number; max: number } {
  let level = 1
  let xpNeeded = 100
  let accumulated = 0
  while (accumulated + xpNeeded <= totalXP) {
    accumulated += xpNeeded
    level++
    xpNeeded = level * 100
  }
  return {
    current: totalXP - accumulated,
    max: xpNeeded,
  }
}

export function getStreakMilestones(): number[] {
  return [7, 10, 15, 21, 30, 50, 60, 100]
}

export function isStreakMilestone(streak: number): boolean {
  if (getStreakMilestones().includes(streak)) return true
  if (streak >= 100 && streak % 100 === 0) return true
  if (streak >= 365 && streak % 365 === 0) return true
  return false
}

export function calculateXPGain(eventType: string, starRating = 0): number {
  const multiplier = starRating === 5 ? 2 : 1
  switch (eventType) {
    case 'habit_complete': return 10 * multiplier
    case 'perfect_day': return 25
    case 'streak_milestone': return 50
    case 'level_up': return 100
    case 'bonus': return 25
    default: return 0
  }
}

export function shouldGetVariableReward(): boolean {
  return Math.random() < 0.2 // 1 in 5
}

export const IDENTITY_COPY: Record<string, string> = {
  'Pod Leader': "Pod Leaders don't miss twice.",
  'Navigator': "Navigators chart the course, even in rough waters.",
  'Deep Dive': "Deep Divers go where others won't.",
  'Tide': "Tides are relentless. So are you.",
  'Swell': "Swells build slowly — then they're unstoppable.",
  'Current': "Currents don't stop. Neither do you.",
  'Wave': "Every wave starts as a ripple.",
  'Ripple': "Every ripple becomes a wave.",
}

export function getIdentityCopy(levelName: string): string {
  return IDENTITY_COPY[levelName] || "You showed up. That's the whole thing."
}
