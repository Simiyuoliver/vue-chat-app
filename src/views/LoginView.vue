<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Global Navigation -->
    <GlobalNavigation />

    <div class="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :disabled="loading"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Login</span>
          </button>

          <!-- Signup Link -->
          <div class="text-center text-sm">
            Don't have an account?
            <router-link to="/signup" class="text-blue-600 hover:text-blue-500 font-medium">Sign up</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import GlobalNavigation from '../components/GlobalNavigation.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '../stores/auth'

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

const handleLogin = async () => {
  // Validate inputs
  if (!email.value || !password.value) {
    toast.error('Please enter both email and password')
    return
  }

  try {
    const result = await authStore.login(email.value, password.value)
    
    if (result.success) {
      toast.success('Login successful!')
      // Redirect to chat
      router.push('/chat')
    } else {
      toast.error(result.message || 'Login failed')
    }
  } catch (error) {
    toast.error('An unexpected error occurred')
    console.error('Login error:', error)
  }
}
</script>
