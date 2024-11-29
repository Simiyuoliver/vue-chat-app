// Encouraging Message Generator
const encouragementTemplates = {
  positive: [
    "You're doing amazing! Keep pushing forward.",
    "Believe in yourself. You have the strength to overcome any challenge.",
    "Every small step is progress. Be proud of yourself!",
    "Your potential is limitless. Keep growing and learning.",
    "You're stronger than you think. You've got this!",
    "Challenges are just opportunities in disguise. Embrace them!",
    "Your hard work and dedication will pay off. Stay focused.",
    "You are capable of incredible things. Trust your journey.",
    "Setbacks are just setups for comebacks. Keep going!",
    "Your resilience is your superpower. Never forget that."
  ],
  supportive: [
    "I'm here to support you through thick and thin.",
    "You're not alone in this. I'm always here for you.",
    "It's okay to take breaks. Self-care is important.",
    "Your feelings are valid. Take time to process them.",
    "You're doing better than you think. Be kind to yourself.",
    "Every day is a new opportunity to grow and improve.",
    "Your mental health matters. Take care of yourself.",
    "Small progress is still progress. Celebrate your wins!",
    "You have an incredible support system. Lean on them.",
    "Your journey is unique. Don't compare yourself to others."
  ],
  motivational: [
    "Success is a journey, not a destination. Enjoy the ride!",
    "Your dreams are valid. Keep working towards them.",
    "Failure is just a stepping stone to success.",
    "You have the power to create the life you want.",
    "Consistency beats intensity. Keep showing up.",
    "Your attitude determines your direction.",
    "Dream big, work hard, stay focused.",
    "The only limit is the one you set for yourself.",
    "Your potential is waiting to be unleashed.",
    "Every expert was once a beginner. Keep learning."
  ]
}

// Sentiment Analysis (Basic Implementation)
const analyzeSentiment = (message) => {
  const negativeTriggers = [
    'sad', 'depressed', 'tired', 'stressed', 'anxious', 
    'overwhelmed', 'difficult', 'struggling', 'hard', 'pain'
  ]
  const positiveTriggers = [
    'happy', 'excited', 'great', 'awesome', 'wonderful', 
    'good', 'progress', 'achieved', 'success', 'proud'
  ]

  const lowercaseMessage = message.toLowerCase()
  
  const negativeCount = negativeTriggers.filter(trigger => 
    lowercaseMessage.includes(trigger)
  ).length
  
  const positiveCount = positiveTriggers.filter(trigger => 
    lowercaseMessage.includes(trigger)
  ).length

  if (negativeCount > positiveCount) return 'supportive'
  if (positiveCount > negativeCount) return 'positive'
  return 'motivational'
}

// Generate Encouraging Reply
export const generateEncouragingReply = (message) => {
  const sentiment = analyzeSentiment(message)
  const templates = encouragementTemplates[sentiment]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

// Additional Helper Functions
export const shouldGenerateReply = (message) => {
  // Implement more sophisticated logic if needed
  return message.length > 10 && Math.random() < 0.7 // 70% chance of reply
}
