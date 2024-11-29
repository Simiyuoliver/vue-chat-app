<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <GlobalNavigation />
    
    <div class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-center mb-12 text-gray-800">Choose Your Plan</h1>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Basic Plan -->
          <div class="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 class="text-2xl font-semibold mb-4 text-gray-800">Basic Plan</h2>
            <p class="text-gray-600 mb-6">Perfect for getting started</p>
            
            <div class="mb-8">
              <span class="text-4xl font-bold text-blue-600">Free</span>
            </div>
            
            <ul class="space-y-4 mb-8 text-gray-700">
              <li>Access to Group Chat</li>
              <li>Basic Features</li>
              <li>Limited Messaging</li>
            </ul>
            
            <button 
              @click="selectBasicPlan"
              class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select Basic Plan
            </button>
          </div>
          
          <!-- Premium Plan -->
          <div class="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 class="text-2xl font-semibold mb-4 text-gray-800">Premium Plan</h2>
            <p class="text-gray-600 mb-6">Unlock full potential</p>
            
            <div class="mb-8">
              <span class="text-4xl font-bold text-green-600">$9.99</span>
              <span class="text-gray-500">/month</span>
            </div>
            
            <ul class="space-y-4 mb-8 text-gray-700">
              <li>Unlimited Chat Access</li>
              <li>Advanced Features</li>
              <li>Priority Support</li>
            </ul>
            
            <button 
              @click="selectPremiumPlan"
              class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Select Premium Plan
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
import { useSubscriptionStore } from '../stores/subscription'
import GlobalNavigation from '../components/GlobalNavigation.vue'

const router = useRouter()
const toast = useToast()
const subscriptionStore = useSubscriptionStore()

const selectBasicPlan = async () => {
  try {
    const result = await subscriptionStore.selectBasicPlan()
    
    if (result.success) {
      toast.success('Basic plan selected successfully!')
      router.push('/chat')
    } else {
      toast.error(result.message)
    }
  } catch (error) {
    toast.error('An error occurred while selecting the plan')
    console.error(error)
  }
}

const selectPremiumPlan = () => {
  router.push('/premium-payment')
}
</script>

<style scoped>
.plan-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
