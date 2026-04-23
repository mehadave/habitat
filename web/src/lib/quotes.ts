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

  // Think and Grow Rich — Napoleon Hill
  { text: "Whatever the mind can conceive and believe, it can achieve.", author: "Napoleon Hill", book: "Think and Grow Rich" },
  { text: "A goal is a dream with a deadline.", author: "Napoleon Hill", book: "Think and Grow Rich" },
  { text: "The starting point of all achievement is desire. Keep this constantly in mind.", author: "Napoleon Hill", book: "Think and Grow Rich" },
  { text: "Strength and growth come only through continuous effort and struggle.", author: "Napoleon Hill", book: "Think and Grow Rich" },
  { text: "Every adversity, every failure, every heartache carries with it the seed of an equal or greater benefit.", author: "Napoleon Hill", book: "Think and Grow Rich" },
  { text: "Patience, persistence, and perspiration make an unbeatable combination for success.", author: "Napoleon Hill", book: "Think and Grow Rich" },

  // The 7 Habits of Highly Effective People — Stephen R. Covey
  { text: "Begin with the end in mind.", author: "Stephen R. Covey", book: "The 7 Habits of Highly Effective People" },
  { text: "Put first things first.", author: "Stephen R. Covey", book: "The 7 Habits of Highly Effective People" },
  { text: "Most people do not listen with the intent to understand; they listen with the intent to reply.", author: "Stephen R. Covey", book: "The 7 Habits of Highly Effective People" },
  { text: "Proactive people focus their efforts on the things they can do something about.", author: "Stephen R. Covey", book: "The 7 Habits of Highly Effective People" },
  { text: "We see the world, not as it is, but as we are — or as we are conditioned to see it.", author: "Stephen R. Covey", book: "The 7 Habits of Highly Effective People" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen R. Covey", book: "The 7 Habits of Highly Effective People" },

  // Start With Why — Simon Sinek
  { text: "People don't buy what you do; they buy why you do it.", author: "Simon Sinek", book: "Start With Why" },
  { text: "Working hard for something we don't care about is called stress; working hard for something we love is called passion.", author: "Simon Sinek", book: "Start With Why" },
  { text: "Dream big. Start small. But most of all, start.", author: "Simon Sinek", book: "Start With Why" },
  { text: "Those who lead inspire us. Whether they are individuals or organizations, we follow those who lead not because we have to but because we want to.", author: "Simon Sinek", book: "Start With Why" },
  { text: "The goal is not to do business with everybody who needs what you have. The goal is to do business with people who believe what you believe.", author: "Simon Sinek", book: "Start With Why" },

  // Grit — Angela Duckworth
  { text: "Enthusiasm is common. Endurance is rare.", author: "Angela Duckworth", book: "Grit" },
  { text: "Grit is passion and perseverance for very long-term goals.", author: "Angela Duckworth", book: "Grit" },
  { text: "Talent is how quickly your skills improve when you invest effort. Achievement is what happens when you take your acquired skills and use them.", author: "Angela Duckworth", book: "Grit" },
  { text: "As much as talent counts, effort counts twice.", author: "Angela Duckworth", book: "Grit" },
  { text: "The most durable form of motivation is interest. The next is purpose.", author: "Angela Duckworth", book: "Grit" },

  // The Compound Effect — Darren Hardy
  { text: "Small, seemingly insignificant steps completed consistently over time will create a radical difference.", author: "Darren Hardy", book: "The Compound Effect" },
  { text: "You make your choices, and then your choices make you.", author: "Darren Hardy", book: "The Compound Effect" },
  { text: "It's not the big things that add up in the end; it's the hundreds, thousands, or millions of little things that separate the ordinary from the extraordinary.", author: "Darren Hardy", book: "The Compound Effect" },
  { text: "The Compound Effect is the strategy of reaping huge rewards from small, seemingly insignificant actions.", author: "Darren Hardy", book: "The Compound Effect" },
  { text: "Your biggest challenge isn't that you've intentionally been making bad choices. Your biggest challenge is that you've been sleepwalking through your choices.", author: "Darren Hardy", book: "The Compound Effect" },

  // Essentialism — Greg McKeown
  { text: "If you don't prioritize your life, someone else will.", author: "Greg McKeown", book: "Essentialism" },
  { text: "The way of the Essentialist is the relentless pursuit of less but better.", author: "Greg McKeown", book: "Essentialism" },
  { text: "Essentialism is not about how to get more things done; it's about how to get the right things done.", author: "Greg McKeown", book: "Essentialism" },
  { text: "Only once you give yourself permission to stop trying to do it all, to stop saying yes to everyone, can you make your highest contribution towards the things that really matter.", author: "Greg McKeown", book: "Essentialism" },
  { text: "A 'no' uttered from the deepest conviction is better than a 'yes' merely uttered to please.", author: "Greg McKeown", book: "Essentialism" },

  // Drive — Daniel Pink
  { text: "The secret to high performance and satisfaction is the deeply human need to direct our own lives, to learn and create new things, and to do better by ourselves and our world.", author: "Daniel Pink", book: "Drive" },
  { text: "Goals that people set for themselves are devoted to attaining mastery are usually healthy. But goals imposed by others can sometimes have dangerous side effects.", author: "Daniel Pink", book: "Drive" },
  { text: "Mastery is a mindset: It requires the capacity to see your abilities not as finite but as infinitely improvable.", author: "Daniel Pink", book: "Drive" },
  { text: "The richest experiences in our lives aren't when we're clamoring for validation from others, but when we're listening to our own voice.", author: "Daniel Pink", book: "Drive" },
  { text: "Autonomous motivation involves acting with full volition and self-endorsement.", author: "Daniel Pink", book: "Drive" },

  // Man's Search for Meaning — Viktor Frankl
  { text: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.", author: "Viktor Frankl", book: "Man's Search for Meaning" },
  { text: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor Frankl", book: "Man's Search for Meaning" },
  { text: "Those who have a 'why' to live, can bear with almost any 'how'.", author: "Viktor Frankl", book: "Man's Search for Meaning" },
  { text: "Life is never made unbearable by circumstances, but only by lack of meaning and purpose.", author: "Viktor Frankl", book: "Man's Search for Meaning" },
  { text: "The meaning of life is to give life meaning.", author: "Viktor Frankl", book: "Man's Search for Meaning" },

  // 12 Rules for Life — Jordan Peterson
  { text: "Compare yourself to who you were yesterday, not to who someone else is today.", author: "Jordan Peterson", book: "12 Rules for Life" },
  { text: "Stand up straight with your shoulders back.", author: "Jordan Peterson", book: "12 Rules for Life" },
  { text: "Pursue what is meaningful, not what is expedient.", author: "Jordan Peterson", book: "12 Rules for Life" },
  { text: "Set your house in perfect order before you criticize the world.", author: "Jordan Peterson", book: "12 Rules for Life" },
  { text: "To stand up straight with your shoulders back is to accept the terrible responsibility of life, with eyes wide open.", author: "Jordan Peterson", book: "12 Rules for Life" },

  // The Alchemist — Paulo Coelho
  { text: "And, when you want something, all the universe conspires in helping you to achieve it.", author: "Paulo Coelho", book: "The Alchemist" },
  { text: "It's the possibility of having a dream come true that makes life interesting.", author: "Paulo Coelho", book: "The Alchemist" },
  { text: "Tell your heart that the fear of suffering is worse than the suffering itself.", author: "Paulo Coelho", book: "The Alchemist" },
  { text: "People are capable, at any time in their lives, of doing what they dream of.", author: "Paulo Coelho", book: "The Alchemist" },
  { text: "The secret of life is to fall seven times and to get up eight times.", author: "Paulo Coelho", book: "The Alchemist" },

  // Meditations — Marcus Aurelius
  { text: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", book: "Meditations" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", book: "Meditations" },
  { text: "Confine yourself to the present.", author: "Marcus Aurelius", book: "Meditations" },
  { text: "Do not indulge in dreams of what you have not, but count the blessings you actually possess.", author: "Marcus Aurelius", book: "Meditations" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", book: "Meditations" },
  { text: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius", book: "Meditations" },

  // Awaken the Giant Within — Tony Robbins
  { text: "It's not what we do once in a while that shapes our lives, but what we do consistently.", author: "Tony Robbins", book: "Awaken the Giant Within" },
  { text: "The path to success is to take massive, determined action.", author: "Tony Robbins", book: "Awaken the Giant Within" },
  { text: "We can change our lives. We can do, have, and be exactly what we wish.", author: "Tony Robbins", book: "Awaken the Giant Within" },
  { text: "Using the power of decision gives you the capacity to get past any excuse to change any and every part of your life in an instant.", author: "Tony Robbins", book: "Awaken the Giant Within" },
  { text: "A real decision is measured by the fact that you've taken a new action. If there's no action, you haven't truly decided.", author: "Tony Robbins", book: "Awaken the Giant Within" },

  // The ONE Thing — Gary Keller
  { text: "What's the ONE Thing you can do such that by doing it everything else will be easier or unnecessary?", author: "Gary Keller", book: "The ONE Thing" },
  { text: "Success is built sequentially. It's one thing at a time.", author: "Gary Keller", book: "The ONE Thing" },
  { text: "Extraordinary results are directly determined by how narrow you can make your focus.", author: "Gary Keller", book: "The ONE Thing" },
  { text: "The way to get the most out of your work and your life is to go as small as possible.", author: "Gary Keller", book: "The ONE Thing" },
  { text: "Time on a task, over time, eventually beats talent every time.", author: "Gary Keller", book: "The ONE Thing" },
]

export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}
