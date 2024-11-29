<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Global Navigation -->
    <GlobalNavigation>
      <template #right>
        <div class="flex justify-center space-x-4">
          <router-link 
            to="/" 
            class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Home
          </router-link>
          <router-link
            to="/login"
            class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Login
          </router-link>
          <router-link
            to="/signup"
            class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Sign Up
          </router-link>
        </div>
      </template>
    </GlobalNavigation>

    <div class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h1 class="text-5xl font-bold text-gray-800 mb-6">
            Connect with friends in real-time
          </h1>
          <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience seamless communication with our modern chat application. Join thousands of users already enjoying instant messaging.
          </p>
          <div class="flex justify-center space-x-4">
            <router-link 
              to="/signup"
              class="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Get Started
            </router-link>
            <router-link
              to="/login"
              class="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Sign In
            </router-link>
          </div>
        </div>

        <!-- Features Section -->
        <div class="grid md:grid-cols-3 gap-8 mt-20">
          <div class="bg-white bg-opacity-10 p-6 rounded-xl text-white">
            <h3 class="text-xl font-semibold mb-4">Real-time Chat</h3>
            <p>Instant messaging with real-time updates and notifications.</p>
          </div>
          <div class="bg-white bg-opacity-10 p-6 rounded-xl text-white">
            <h3 class="text-xl font-semibold mb-4">Secure</h3>
            <p>End-to-end encryption ensures your conversations stay private.</p>
          </div>
          <div class="bg-white bg-opacity-10 p-6 rounded-xl text-white">
            <h3 class="text-xl font-semibold mb-4">User Friendly</h3>
            <p>Clean and intuitive interface for the best chat experience.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GlobalNavigation from '../components/GlobalNavigation.vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
