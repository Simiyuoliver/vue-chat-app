import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    currentSubscription: JSON.parse(localStorage.getItem('subscription')) || null,
    loading: false,
    error: null
  }),

  actions: {
    async selectBasicPlan() {
      try {
        this.loading = true
        this.error = null

        // Simulate or call backend to confirm basic plan
        const subscription = {
          planType: 'basic',
          paymentProcessed: true,
          accessLevel: 'standard'
        }

        // Store subscription locally
        this.currentSubscription = subscription
        localStorage.setItem('subscription', JSON.stringify(subscription))

        return { 
          success: true, 
          redirectTo: '/chat',
          message: 'Basic plan selected successfully' 
        }
      } catch (error) {
        console.error('Plan selection error:', error)
        this.error = error.message || 'Failed to select plan'
        return { 
          success: false, 
          message: this.error 
        }
      } finally {
        this.loading = false
      }
    },

    clearSubscription() {
      this.currentSubscription = null
      localStorage.removeItem('subscription')
    }
  },

  getters: {
    isBasicPlan: (state) => state.currentSubscription?.planType === 'basic',
    hasActiveSubscription: (state) => !!state.currentSubscription
  }
})
