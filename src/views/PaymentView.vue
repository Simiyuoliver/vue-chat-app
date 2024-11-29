<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Global Navigation -->
    <GlobalNavigation />

    <div class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Choose Your Plan</h1>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Basic Plan -->
          <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Basic</h2>
            <p class="text-4xl font-bold text-blue-600 mb-6">$0</p>
            <p class="text-gray-600 mb-4">Free forever</p>
            <ul class="text-sm text-gray-700 space-y-3 mb-6">
              <li>✓ Limited Chat Messages</li>
              <li>✓ Basic Message Filters</li>
              <li>✓ Community Support</li>
            </ul>
            <button 
              @click="selectPlan('basic')"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select Basic
            </button>
          </div>

          <!-- Premium Plan -->
          <div class="bg-white rounded-lg shadow-lg p-6 text-center border-2 border-blue-600">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Premium</h2>
            <p class="text-4xl font-bold text-blue-600 mb-6">$9.99</p>
            <p class="text-gray-600 mb-4">Per Month</p>
            <ul class="text-sm text-gray-700 space-y-3 mb-6">
              <li>✓ Unlimited Chat Messages</li>
              <li>✓ Advanced Message Filters</li>
              <li>✓ Priority Support</li>
              <li>✓ Custom Themes</li>
              <li>✓ AI Chat Assistant</li>
            </ul>
            <button 
              @click="selectPlan('premium')"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import GlobalNavigation from '../components/GlobalNavigation.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const selectPlan = async (planType) => {
  try {
    // Update user's selected plan
    await authStore.updateSubscription({ 
      planType,
      paymentProcessed: planType === 'basic' 
    })

    // Navigate based on plan type
    if (planType === 'basic') {
      toast.success('Basic plan activated!')
      router.push('/chat')
    } else {
      // Redirect to payment for Pro and Premium plans
      toast.info('Complete your payment to activate the plan')
      router.push('/premium-payment')
    }
  } catch (error) {
    toast.error('Failed to select plan. Please try again.')
    console.error('Plan selection error:', error)
  }
}
</script>

<style scoped>
/* Additional styling can be added here if needed */
</style>
