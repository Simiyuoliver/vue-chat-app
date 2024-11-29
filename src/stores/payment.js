import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from './auth'

export const usePaymentStore = defineStore('payment', () => {
  const router = useRouter()
  const toast = useToast()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref(null)
  const selectedPlan = ref(null)

  const plans = computed(() => ({
    basic: {
      name: 'Basic Plan',
      price: 0,
      features: [
        'Basic chat features',
        'Up to 100 messages/day',
        'Standard support'
      ]
    },
    premium: {
      name: 'Premium Plan',
      price: 9.99,
      features: [
        'Unlimited messages',
        'Priority support',
        'Custom themes'
      ]
    }
  }))

  async function selectPlan(planType) {
    try {
      loading.value = true
      error.value = null

      // Validate plan type
      if (!['basic', 'premium'].includes(planType)) {
        throw new Error('Invalid plan selection')
      }

      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user'))

      if (!token || !user?.id) {
        router.push('/login')
        throw new Error('Please log in to select a plan')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          planType
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to select plan')
      }

      selectedPlan.value = planType

      // Store subscription data with more details
      const subscriptionData = {
        planType,
        status: data.status || 'pending',
        paymentProcessed: data.paymentProcessed || false,
        subscriptionId: data.subscriptionId
      }
      localStorage.setItem('subscription', JSON.stringify(subscriptionData))

      // Redirect based on plan type
      if (planType === 'basic') {
        toast.success('Basic plan activated successfully!')
        router.push('/chat')
      } else if (planType === 'premium') {
        toast.info('Please complete payment for Premium plan')
        router.push('/premium-payment')
      }
    } catch (err) {
      error.value = err.message
      console.error('Detailed Plan Selection Error:', err)
      toast.error(err.message || 'Failed to select plan. Please try again.')
    } finally {
      loading.value = false
    }
  }

  async function processPremiumPayment(paymentDetails) {
    try {
      loading.value = true
      error.value = null

      // Comprehensive payment details validation
      const validationError = validatePaymentDetails(paymentDetails)
      if (validationError) {
        throw new Error(validationError)
      }

      // Mask sensitive card details for logging
      const maskedDetails = {
        ...paymentDetails,
        cardNumber: maskCardNumber(paymentDetails.cardNumber),
        cvv: '***'
      }
      console.log('Processing payment with details:', maskedDetails)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentDetails)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Payment processing failed')
      }

      // More detailed success handling
      localStorage.setItem('subscription', JSON.stringify({
        planType: 'premium',
        status: responseData.status || 'active',
        paymentProcessed: true,
        transactionId: responseData.transactionId,
        subscriptionId: responseData.subscriptionId
      }))

      toast.success('Payment processed successfully!')
      router.push('/chat')
    } catch (err) {
      error.value = err.message
      console.error('Detailed Payment Error:', err)
      toast.error(err.message || 'Payment failed. Please contact support.')
    } finally {
      loading.value = false
    }
  }

  // Validation functions
  function validatePaymentDetails(details) {
    if (!details.cardName || details.cardName.trim().length < 2) {
      return 'Invalid card name'
    }

    if (!details.cardNumber || !/^\d{16}$/.test(details.cardNumber.replace(/\s/g, ''))) {
      return 'Invalid card number'
    }

    if (!details.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiry)) {
      return 'Invalid expiry date (use MM/YY format)'
    }

    if (!details.cvv || !/^\d{3,4}$/.test(details.cvv)) {
      return 'Invalid CVV'
    }

    return null
  }

  // Utility function to mask card number
  function maskCardNumber(cardNumber) {
    const strippedNumber = cardNumber.replace(/\s/g, '')
    return `****-****-****-${strippedNumber.slice(-4)}`
  }

  return {
    loading,
    error,
    plans,
    selectedPlan,
    selectPlan,
    processPremiumPayment
  }
})
