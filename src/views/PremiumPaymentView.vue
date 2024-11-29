<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Global Navigation -->
    <GlobalNavigation />

    <div class="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h2 class="text-3xl font-bold text-center mb-6 text-gray-800">Upgrade to Premium</h2>
        
        <!-- Pricing Overview -->
        <div class="bg-blue-50 rounded-lg p-6 text-center">
          <p class="text-xl font-semibold text-blue-800 mb-2">Premium Plan</p>
          <p class="text-3xl font-bold text-blue-900 mb-4">$9.99 / month</p>
          <ul class="text-sm text-blue-700 space-y-2 mb-4">
            <li>✓ Unlimited Chat Messages</li>
            <li>✓ Advanced Message Filters</li>
            <li>✓ Priority Customer Support</li>
          </ul>
        </div>

        <!-- Payment Form -->
        <form @submit.prevent="processPayment" class="space-y-4">
          <!-- Card Holder Name -->
          <div>
            <label for="cardName" class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
            <input 
              id="cardName"
              v-model="cardName"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': formErrors.cardName }"
              :disabled="processing"
              @input="validateField('cardName')"
            />
            <p v-if="formErrors.cardName" class="mt-1 text-sm text-red-500">{{ formErrors.cardName }}</p>
          </div>

          <!-- Card Number -->
          <div>
            <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input 
              id="cardNumber"
              v-model="cardNumber"
              type="text"
              required
              placeholder="1234 5678 9012 3456"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': formErrors.cardNumber }"
              :disabled="processing"
              @input="formatCardNumber"
            />
            <p v-if="formErrors.cardNumber" class="mt-1 text-sm text-red-500">{{ formErrors.cardNumber }}</p>
          </div>

          <!-- Expiry and CVV -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="expiry" class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input 
                id="expiry"
                v-model="expiry"
                type="text"
                required
                placeholder="MM/YY"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': formErrors.expiry }"
                :disabled="processing"
                @input="formatExpiry"
              />
              <p v-if="formErrors.expiry" class="mt-1 text-sm text-red-500">{{ formErrors.expiry }}</p>
            </div>
            <div>
              <label for="cvv" class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input 
                id="cvv"
                v-model="cvv"
                type="text"
                required
                placeholder="123"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': formErrors.cvv }"
                :disabled="processing"
                @input="formatCVV"
              />
              <p v-if="formErrors.cvv" class="mt-1 text-sm text-red-500">{{ formErrors.cvv }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            :disabled="processing || !isFormValid"
          >
            <svg
              v-if="processing"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ processing ? 'Processing...' : 'Upgrade to Premium' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import GlobalNavigation from '../components/GlobalNavigation.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// Form Fields
const cardName = ref('')
const cardNumber = ref('')
const expiry = ref('')
const cvv = ref('')

// State Management
const processing = ref(false)
const error = ref('')

// Form Errors
const formErrors = ref({
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: ''
})

// Validation Methods
const validateField = (field) => {
  switch(field) {
    case 'cardName':
      formErrors.value.cardName = cardName.value.length < 3 
        ? 'Name must be at least 3 characters' 
        : ''
      break
    case 'cardNumber':
      const cardNumberRegex = /^(\d{4}\s?){3}\d{4}$/
      formErrors.value.cardNumber = !cardNumberRegex.test(cardNumber.value) 
        ? 'Invalid card number' 
        : ''
      break
    case 'expiry':
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
      formErrors.value.expiry = !expiryRegex.test(expiry.value) 
        ? 'Invalid expiry date (MM/YY)' 
        : ''
      break
    case 'cvv':
      const cvvRegex = /^\d{3}$/
      formErrors.value.cvv = !cvvRegex.test(cvv.value) 
        ? 'Invalid CVV' 
        : ''
      break
  }
}

// Formatting Methods
const formatCardNumber = () => {
  cardNumber.value = cardNumber.value
    .replace(/\s+/g, '')  // Remove existing spaces
    .replace(/(\d{4})/g, '$1 ')  // Add space after every 4 digits
    .trim()
}

const formatExpiry = () => {
  expiry.value = expiry.value
    .replace(/\D/g, '')  // Remove non-digits
    .slice(0, 4)  // Limit to 4 characters
    .replace(/^(\d{2})(\d{2})$/, '$1/$2')  // Add slash
}

const formatCVV = () => {
  cvv.value = cvv.value
    .replace(/\D/g, '')  // Remove non-digits
    .slice(0, 3)  // Limit to 3 characters
}

// Form Validation
const isFormValid = computed(() => {
  return cardName.value && 
         cardNumber.value && 
         expiry.value && 
         cvv.value && 
         !formErrors.value.cardName &&
         !formErrors.value.cardNumber &&
         !formErrors.value.expiry &&
         !formErrors.value.cvv
})

// Payment Processing
const processPayment = async () => {
  // Validate all fields before submission
  ['cardName', 'cardNumber', 'expiry', 'cvv'].forEach(validateField)

  if (!isFormValid.value) {
    toast.error('Please correct the errors in the form')
    return
  }

  processing.value = true
  error.value = ''

  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update subscription status
    await authStore.updateSubscription({
      planType: 'premium',
      paymentProcessed: true
    })

    toast.success('Payment successful! Upgraded to Premium Plan')
    router.push('/chat')
  } catch (err) {
    error.value = err.message || 'Payment processing failed'
    toast.error(error.value)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
/* Add any additional scoped styles if needed */
</style>
