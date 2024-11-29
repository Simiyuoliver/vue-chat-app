import axios from 'axios'

class OpenAIService {
  constructor() {
    // Use environment variable for API key
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.baseURL = 'https://api.openai.com/v1/chat/completions'
    
    // Enhanced rate limit handling
    this.rateLimitInfo = {
      remainingRequests: Infinity,
      resetTime: null,
      backoffTime: 0
    }

    // Conversation context tracking
    this.conversationHistory = []
    this.maxHistoryLength = 10
    this.retryCount = 0
    this.maxRetries = 3

    // Detailed logging
    this.debugLog('OpenAI Service Initialized', {
      apiKeyPresent: !!this.apiKey,
      baseURL: this.baseURL
    })
  }

  // Debug logging method
  debugLog(message, data = null) {
    console.log(`[OpenAIService] ${message}`, data || '')
  }

  // Check and manage rate limits
  _checkRateLimit(headers) {
    if (headers) {
      this.rateLimitInfo.remainingRequests = parseInt(headers['x-ratelimit-remaining-requests'] || Infinity)
      this.rateLimitInfo.resetTime = headers['x-ratelimit-reset-tokens'] 
        ? new Date(Date.now() + parseInt(headers['x-ratelimit-reset-tokens']) * 1000)
        : null
      
      this.debugLog('Rate Limit Status', this.rateLimitInfo)
    }
  }

  // Sanitize and prepare message for API
  _sanitizeMessage(message) {
    // Remove any potentially harmful content
    return message.replace(/[<>]/g, '')
  }

  // Prepare conversation context
  _prepareContext() {
    return this.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  }

  // Fallback responses for different scenarios
  _getFallbackResponse(errorType) {
    const fallbackResponses = {
      rateLimit: "I'm experiencing high traffic right now. Could you please try again in a few moments?",
      apiError: "I'm having trouble processing your message at the moment. Our support team has been notified.",
      networkError: "There seems to be a connection issue. Would you like to try sending your message again?"
    }
    return fallbackResponses[errorType] || "I'm experiencing some technical difficulties. Would you like to try again?"
  }

  // Main chat method with comprehensive error handling
  async generateResponse(userMessage, context = {}) {
    // Validate API key
    if (!this.apiKey) {
      this.debugLog('ERROR: No API key configured')
      throw new Error('OpenAI API key is not configured. Please check your .env file.')
    }

    // Check if we need to wait due to previous rate limit
    if (this.rateLimitInfo.resetTime && new Date() < this.rateLimitInfo.resetTime) {
      const waitTime = this.rateLimitInfo.resetTime.getTime() - Date.now()
      this.debugLog(`Waiting for rate limit reset: ${waitTime/1000} seconds`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    const sanitizedMessage = this._sanitizeMessage(userMessage)

    // Detailed request logging
    this.debugLog('Preparing API Request', {
      messageLength: sanitizedMessage.length,
      context: JSON.stringify(context)
    })

    // Prepare request payload
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a compassionate, intelligent therapy assistant. 
          Provide empathetic, supportive, and constructive responses. 
          Focus on mental health, emotional well-being, and personal growth. 
          Use a warm, understanding tone. 
          If asked for serious medical advice, recommend consulting a professional.
          Context: ${JSON.stringify(context)}`
        },
        ...this._prepareContext(),
        {
          role: 'user',
          content: sanitizedMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.6
    }

    try {
      // Log full request details (be careful with sensitive info)
      this.debugLog('Sending API Request', {
        url: this.baseURL,
        model: payload.model,
        messageCount: payload.messages.length
      })

      const response = await axios.post(this.baseURL, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        // Add timeout to prevent hanging
        timeout: 15000 // 15 seconds
      })

      // Check and log rate limit information
      this._checkRateLimit(response.headers)

      // Log response details
      this.debugLog('API Response Received', {
        status: response.status,
        responseLength: response.data.choices[0]?.message?.content?.length || 0
      })

      const botResponse = response.data.choices[0].message.content.trim()

      // Reset retry count on successful response
      this.retryCount = 0

      // Add messages to conversation history
      this._addToHistory('user', sanitizedMessage)
      this._addToHistory('assistant', botResponse)

      return {
        response: botResponse,
        tokens: response.data.usage.total_tokens
      }
    } catch (error) {
      // Comprehensive error logging
      this.debugLog('API Error', {
        message: error.message,
        response: error.response ? JSON.stringify(error.response.data) : 'No response',
        status: error.response ? error.response.status : 'Unknown',
        headers: error.response ? JSON.stringify(error.response.headers) : 'No headers'
      })

      // Handle specific error scenarios
      if (error.response) {
        switch (error.response.status) {
          case 429: // Rate limit exceeded
            this.debugLog('Rate Limit Exceeded', error.response.headers)
            return {
              response: this._getFallbackResponse('rateLimit'),
              tokens: 0
            }
          
          case 401: // Authentication error
            return {
              response: "There's an issue with the API authentication. Please check your API key.",
              tokens: 0
            }
          
          case 500: // Server error
            return {
              response: this._getFallbackResponse('apiError'),
              tokens: 0
            }
        }
      }

      // Network or other errors
      return {
        response: this._getFallbackResponse('networkError'),
        tokens: 0
      }
    }
  }

  // Add message to conversation history
  _addToHistory(role, content) {
    this.conversationHistory.push({ role, content })
    
    // Trim history to maintain context window
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift()
    }
  }

  // Reset conversation context
  resetContext() {
    this.conversationHistory = []
    this.retryCount = 0
    this.rateLimitInfo = {
      remainingRequests: Infinity,
      resetTime: null,
      backoffTime: 0
    }
  }
}

export const openaiService = new OpenAIService()
