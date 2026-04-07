export interface Quote {
  text: string
  author: string
  book: string
}

export const QUOTES: Quote[] = [
  // Atomic Habits — James Clear
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", book: "Atomic Habits" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear", book: "Atomic Habits" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear", book: "Atomic Habits" },
  { text: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.", author: "James Clear", book: "Atomic Habits" },
  { text: "Success is the product of daily habits — not once-in-a-lifetime transformations.", author: "James Clear", book: "Atomic Habits" },
  { text: "The more you let a single belief define you, the less capable you are of adapting when life challenges you.", author: "James Clear", book: "Atomic Habits" },
  { text: "A small change in your daily habits can guide your life to a very different destination.", author: "James Clear", book: "Atomic Habits" },
  { text: "You don't have to be the victim of your environment. You can also be the architect of it.", author: "James Clear", book: "Atomic Habits" },
  { text: "Be the designer of your world and not merely the consumer of it.", author: "James Clear", book: "Atomic Habits" },
  { text: "Professionals stick to the schedule; amateurs let life get in the way.", author: "James Clear", book: "Atomic Habits" },
  { text: "The purpose of setting goals is to win the game. The purpose of building systems is to continue playing the game.", author: "James Clear", book: "Atomic Habits" },
  { text: "Make it obvious. Make it attractive. Make it easy. Make it satisfying.", author: "James Clear", book: "Atomic Habits" },

  // The Power of Habit — Charles Duhigg
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett", book: "The Power of Habit" },
  { text: "Change might not be fast and it isn't always easy. But with time and effort, almost any habit can be reshaped.", author: "Charles Duhigg", book: "The Power of Habit" },
  { text: "Champions don't do extraordinary things. They do ordinary things, but they do them without thinking.", author: "Charles Duhigg", book: "The Power of Habit" },
  { text: "Once you understand that habits can change, you have the freedom and the responsibility to remake them.", author: "Charles Duhigg", book: "The Power of Habit" },
  { text: "Keystone habits transform us by creating cultures where excellence becomes inevitable.", author: "Charles Duhigg", book: "The Power of Habit" },
  { text: "Small wins are exactly what they sound like, and are part of how keystone habits create widespread changes.", author: "Charles Duhigg", book: "The Power of Habit" },

  // Tiny Habits — BJ Fogg
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun", book: "Tiny Habits" },
  { text: "The best way to design a new habit is to make it tiny.", author: "BJ Fogg", book: "Tiny Habits" },
  { text: "Celebrate every tiny success. Emotions create habits, not repetition.", author: "BJ Fogg", book: "Tiny Habits" },
  { text: "You are not lazy. You are not broken. The design of your habits needs revision.", author: "BJ Fogg", book: "Tiny Habits" },
  { text: "Help yourself do what you already want to do. That's what tiny habits are about.", author: "BJ Fogg", book: "Tiny Habits" },
  { text: "Breakthrough changes come from a series of small wins, not one massive effort.", author: "BJ Fogg", book: "Tiny Habits" },

  // Can't Hurt Me — David Goggins
  { text: "The only way out is through.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "You are stopping you. You are giving up instead of getting hard.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "Most people give up when they've only given 40% of their effort.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "Be uncommon amongst uncommon people.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "When you think you're done, you're only at 40% of what your body is capable of.", author: "David Goggins", book: "Can't Hurt Me" },

  // The 5 AM Club — Robin Sharma
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", book: "The 5 AM Club" },
  { text: "All change is hard at first, messy in the middle, and gorgeous at the end.", author: "Robin Sharma", book: "The 5 AM Club" },
  { text: "Own your morning. Elevate your life.", author: "Robin Sharma", book: "The 5 AM Club" },
  { text: "World-class begins where your comfort zone ends.", author: "Robin Sharma", book: "The 5 AM Club" },
  { text: "Victims recite problems. Leaders devise solutions.", author: "Robin Sharma", book: "The 5 AM Club" },

  // Deep Work — Cal Newport
  { text: "Clarity about what matters provides clarity about what does not.", author: "Cal Newport", book: "Deep Work" },
  { text: "The ability to perform deep work is becoming increasingly rare and valuable.", author: "Cal Newport", book: "Deep Work" },
  { text: "Commit to specific habits that protect your time for intensity.", author: "Cal Newport", book: "Deep Work" },
  { text: "Your work is craft, and if you hone your ability and apply it with respect and care, then like the skilled craftsman, you can generate meaning in the daily efforts of your professional life.", author: "Cal Newport", book: "Deep Work" },

  // Discipline Equals Freedom — Jocko Willink
  { text: "Discipline equals freedom.", author: "Jocko Willink", book: "Discipline Equals Freedom" },
  { text: "Good. Now get to work.", author: "Jocko Willink", book: "Discipline Equals Freedom" },
  { text: "The temptation to rest and recover is always there. Don't give in.", author: "Jocko Willink", book: "Discipline Equals Freedom" },
  { text: "Where does mental toughness come from? It comes from discipline. Discipline in practice, in training, in preparation.", author: "Jocko Willink", book: "Discipline Equals Freedom" },

  // The Miracle Morning — Hal Elrod
  { text: "How you wake up each day largely determines who you are and what you do in any given day.", author: "Hal Elrod", book: "The Miracle Morning" },
  { text: "Your level of success will rarely exceed your level of personal development.", author: "Hal Elrod", book: "The Miracle Morning" },
  { text: "Every day you say no to your fears is a day you push them back.", author: "Hal Elrod", book: "The Miracle Morning" },
  { text: "You have to be willing to be uncomfortable — to be the person who does what others won't.", author: "Hal Elrod", book: "The Miracle Morning" },

  // Mindset — Carol Dweck
  { text: "In a growth mindset, challenges are exciting rather than threatening.", author: "Carol Dweck", book: "Mindset" },
  { text: "Becoming is better than being.", author: "Carol Dweck", book: "Mindset" },
  { text: "The view you adopt for yourself profoundly affects the way you lead your life.", author: "Carol Dweck", book: "Mindset" },
  { text: "Effort is what ignites ability and turns it into accomplishment.", author: "Carol Dweck", book: "Mindset" },

  // High Performance Habits — Brendon Burchard
  { text: "High performers are clear about who they are becoming.", author: "Brendon Burchard", book: "High Performance Habits" },
  { text: "Dare to be who you intend to be — starting today.", author: "Brendon Burchard", book: "High Performance Habits" },
  { text: "Consistency over intensity. Show up even when you don't feel like it.", author: "Brendon Burchard", book: "High Performance Habits" },
  { text: "The greatest human challenge is staying committed when you are not yet seeing results.", author: "Brendon Burchard", book: "High Performance Habits" },
]

export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}
