class TherapyBot {
  constructor() {
    this.conversationContext = {
      currentMood: null,
      discussedTopics: [],
      emotionalIntensity: 0,
      conversationHistory: [],
      keywordMemory: new Set(),
      empathyLevel: 0.5,
      responseCache: new Map() // New cache to prevent repetitive responses
    }
  }

  // Sentiment Analysis Method
  analyzeSentiment(message) {
    // Lowercase for consistent matching
    const lowercaseMessage = message.toLowerCase()
    
    // Sentiment Keywords
    const sentimentPatterns = {
      depression: [
        'sad', 'depressed', 'hopeless', 'worthless', 'tired', 'lonely', 
        'overwhelmed', 'exhausted', 'empty', 'dark', 'struggle'
      ],
      anxiety: [
        'worried', 'anxious', 'nervous', 'panic', 'stress', 'afraid', 
        'overwhelmed', 'tense', 'restless', 'scared'
      ],
      anger: [
        'angry', 'furious', 'rage', 'irritated', 'frustrated', 'mad', 
        'annoyed', 'hostile'
      ],
      grief: [
        'loss', 'grieving', 'mourning', 'heartbroken', 'missing', 
        'devastated', 'pain', 'hurt'
      ],
      positive: [
        'happy', 'joy', 'excited', 'grateful', 'hopeful', 'proud', 
        'optimistic', 'love', 'peace'
      ]
    }

    // Sentiment Scoring
    let sentimentScores = {
      depression: 0,
      anxiety: 0,
      anger: 0,
      grief: 0,
      positive: 0
    }

    // Calculate sentiment scores
    Object.entries(sentimentPatterns).forEach(([sentiment, keywords]) => {
      keywords.forEach(keyword => {
        const matches = (lowercaseMessage.match(new RegExp(keyword, 'g')) || []).length
        sentimentScores[sentiment] += matches * (sentiment === 'positive' ? 1 : 2)
      })
    })

    // Determine dominant sentiment
    const dominantSentiment = Object.entries(sentimentScores)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0]

    // Calculate sentiment strength (0-1 range)
    const totalScore = Object.values(sentimentScores).reduce((a, b) => a + b, 0)
    const sentimentStrength = Math.min(totalScore / 10, 1)

    return { 
      sentiment: dominantSentiment, 
      strength: sentimentStrength 
    }
  }

  // Fallback for neutral sentiment
  getFallbackSentiment() {
    return { sentiment: 'neutral', strength: 0.3 }
  }

  // Enhanced method to generate unique responses
  generateUniqueResponse(message, sentimentAnalysis) {
    const { sentiment, strength } = sentimentAnalysis
    const cacheKey = `${sentiment}-${strength}`

    // Check response cache
    const cachedResponses = this.conversationContext.responseCache.get(cacheKey) || []
    
    // Sentiment-specific response templates with more variations
    const responseTemplates = {
      depression: [
        {
          low: [
            "I hear you're going through a challenging time. Your feelings are valid.",
            "Some days can feel really heavy. Would you like to talk about what's weighing on you?",
            "It's okay to not be okay. Small steps can make a big difference."
          ],
          medium: [
            "Depression can feel like an overwhelming weight. Let's explore some gentle coping strategies.",
            "Your emotions are valid. Would you like to discuss ways to manage these feelings?",
            "Living with depression is challenging. What small act of self-care could help today?"
          ],
          high: [
            "I sense you're experiencing deep emotional pain. Your struggle is real, and you're not alone.",
            "The weight of depression can be immense. Would you be open to discussing professional support options?",
            "Your resilience in facing these feelings is remarkable. How can we work through this together?"
          ]
        }
      ],
      anxiety: [
        {
          low: [
            "Anxiety can be unsettling. Let's take a deep breath together.",
            "Feeling anxious is tough. What's helping you stay grounded?",
            "Small moments of calm can make a big difference."
          ],
          medium: [
            "Your anxiety is valid. Would you like to break down what's causing you stress?",
            "Anxiety often comes from uncertainty. Let's explore some strategies.",
            "Managing anxiety is a journey. What triggers have you noticed recently?"
          ],
          high: [
            "Anxiety can feel overwhelming. I'm here to listen without judgment.",
            "These intense feelings are challenging. Would you be interested in learning advanced coping techniques?",
            "Your experience with anxiety is unique. How can we develop a personalized approach to managing it?"
          ]
        }
      ],
      anger: [
        {
          low: [
            "I notice you're feeling frustrated. It's okay to feel angry.",
            "What typically helps you process frustration?",
            "Let's explore some strategies to manage these feelings."
          ],
          medium: [
            "Anger often signals that something important to you isn't being addressed. Would you like to explore the root of these feelings?",
            "Your anger is valid. Would you like to discuss ways to manage these feelings?",
            "Living with anger can be challenging. What small act of self-care could help today?"
          ],
          high: [
            "Your anger is a powerful emotion that deserves careful attention. Let's work together to understand and process these intense feelings constructively.",
            "The weight of anger can be immense. Would you be open to discussing professional support options?",
            "Your resilience in facing these feelings is remarkable. How can we work through this together?"
          ]
        }
      ],
      grief: [
        {
          low: [
            "Grief is a deeply personal journey. There's no 'right' way to experience loss.",
            "How are you taking care of yourself today?",
            "Small moments of comfort can make a big difference."
          ],
          medium: [
            "Losing someone or something important can be incredibly painful. Would you like to share more about your experience?",
            "Your emotions are valid. Would you like to discuss ways to manage these feelings?",
            "Living with grief is challenging. What small act of self-care could help today?"
          ],
          high: [
            "The depth of your grief reflects the profound love and connection you've experienced. I'm here to provide a compassionate, supportive space as you navigate this challenging emotional terrain.",
            "Grief can feel overwhelming. Would you be open to discussing professional support options?",
            "Your resilience in facing these feelings is remarkable. How can we work through this together?"
          ]
        }
      ],
      positive: [
        {
          low: [
            "It's wonderful that you're experiencing positive emotions!",
            "What small victories are you celebrating?",
            "Small moments of joy can make a big difference."
          ],
          medium: [
            "Celebrating good moments is important for mental wellness. What's contributing to your joy?",
            "Your positive emotions are valid. Would you like to discuss ways to maintain these feelings?",
            "Living with positivity is wonderful. What small act of self-care could help today?"
          ],
          high: [
            "Your ability to find happiness and maintain resilience is truly admirable. Let's explore how you can continue nurturing these positive feelings.",
            "The weight of positivity can be immense. Would you be open to discussing professional support options?",
            "Your resilience in facing challenges is remarkable. How can we work through this together?"
          ]
        }
      ],
      neutral: [
        {
          low: [
            "I'm here to listen. What's on your mind today?",
            "Every conversation is an opportunity for reflection.",
            "Feel free to share whatever you're comfortable with."
          ],
          medium: [
            "I'm interested in understanding your perspective.",
            "What would you like to explore today?",
            "Sometimes talking can provide clarity. What would you like to discuss?"
          ],
          high: [
            "I'm creating a safe, non-judgmental space for you.",
            "Your thoughts and feelings are important. How can I support you?",
            "Let's dive deeper into what's meaningful to you right now."
          ]
        }
      ]
    }

    // Get available responses for this sentiment and empathy level
    const getEmpathyLevel = (strength) => {
      if (strength < 0.4) return 'low'
      if (strength < 0.7) return 'medium'
      return 'high'
    }
    const empathyLevel = getEmpathyLevel(strength)
    const availableResponses = responseTemplates[sentiment][0][empathyLevel]

    // Filter out previously used responses
    const newResponses = availableResponses.filter(
      response => !cachedResponses.includes(response)
    )

    // If all responses have been used, reset the cache
    const selectedResponse = newResponses.length > 0 
      ? newResponses[Math.floor(Math.random() * newResponses.length)]
      : availableResponses[Math.floor(Math.random() * availableResponses.length)]

    // Update response cache
    const updatedCache = [...cachedResponses, selectedResponse]
    this.conversationContext.responseCache.set(cacheKey, 
      updatedCache.slice(Math.max(updatedCache.length - 3, 0))
    )

    return selectedResponse
  }

  // Generate Follow-up Question
  generateFollowUpQuestion(sentiment, empathyLevel) {
    const followUpQuestions = {
      depression: {
        low: "Would you like to share a bit more about what's been on your mind?",
        medium: "How have these feelings been impacting your daily life?",
        high: "What support systems do you currently have in place?"
      },
      anxiety: {
        low: "What helps you feel a bit more calm when anxiety rises?",
        medium: "Can you identify any specific triggers for your anxiety?",
        high: "Have you considered professional strategies for managing these intense feelings?"
      },
      anger: {
        low: "What typically helps you process and release frustration?",
        medium: "Would you like to explore healthier ways of expressing these emotions?",
        high: "How do these intense feelings affect your relationships and well-being?"
      },
      grief: {
        low: "How are you taking care of yourself during this difficult time?",
        medium: "Would you like to share a memory that brings you comfort?",
        high: "What support do you need to navigate through this grief?"
      },
      positive: {
        low: "What's bringing you joy today?",
        medium: "How can you continue nurturing these positive feelings?",
        high: "What personal strengths have helped you maintain this positive outlook?"
      },
      neutral: {
        low: "Is there anything specific you'd like to discuss?",
        medium: "What's been on your mind recently?",
        high: "How can I best support you in this moment?"
      }
    }

    return followUpQuestions[sentiment][empathyLevel]
  }

  // Main response generation method
  generateResponse(message, sentimentAnalysis = null) {
    // Perform sentiment analysis if not provided
    const analysis = sentimentAnalysis || 
      this.analyzeSentiment(message) || 
      this.getFallbackSentiment()

    const { sentiment, strength } = analysis

    // Update conversation context
    this.conversationContext.conversationHistory.push({
      message,
      sentiment,
      strength,
      timestamp: new Date()
    })

    // Generate unique response
    const selectedResponse = this.generateUniqueResponse(message, analysis)

    // Optional: Add personalized follow-up
    const followUp = this.generateFollowUpQuestion(
      sentiment, 
      strength < 0.4 ? 'low' : (strength < 0.7 ? 'medium' : 'high')
    )

    return {
      response: `${selectedResponse} ${followUp}`.trim(),
      sentiment: sentiment,
      strength: strength,
      followUp: followUp
    }
  }

  // Process entire message flow
  processMessage(message) {
    // Perform sentiment analysis
    const sentimentAnalysis = this.analyzeSentiment(message)

    // Generate comprehensive response
    return this.generateResponse(message, sentimentAnalysis)
  }

  // Reset conversation context
  resetContext() {
    this.conversationContext = {
      currentMood: null,
      discussedTopics: [],
      emotionalIntensity: 0,
      conversationHistory: [],
      keywordMemory: new Set(),
      empathyLevel: 0.5,
      responseCache: new Map()
    }
  }
}

export const therapyBot = new TherapyBot()
