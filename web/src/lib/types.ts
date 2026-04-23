export interface User {
  id: string
  email?: string
  phone?: string
  display_name?: string
  avatar_url?: string
  created_at: string
  dark_mode: boolean
}

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji?: string
  description?: string
  is_private: boolean
  is_active: boolean
  created_at: string
  sort_order: number
  star_rating: number
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export interface Streak {
  id?: string
  habit_id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_completed_date?: string
  streak_start_date?: string
}

export interface JournalEntry {
  id: string
  user_id: string
  content: string
  mood_score?: number
  category?: string
  created_at: string
  updated_at: string
}


export type HabitWithStreak = Habit & {
  streak?: Streak
  completions?: string[] // ISO date strings
}
