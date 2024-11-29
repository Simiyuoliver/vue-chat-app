<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Global Navigation -->
    <GlobalNavigation />

    <div class="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">Create Account</h2>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name Input -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': formErrors.name }"
              :disabled="loading"
              @input="validateField('name')"
            />
            <p v-if="formErrors.name" class="mt-1 text-sm text-red-500">{{ formErrors.name }}</p>
          </div>

          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': formErrors.email }"
              :disabled="loading"
              @input="validateField('email')"
            />
            <p v-if="formErrors.email" class="mt-1 text-sm text-red-500">{{ formErrors.email }}</p>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="6"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': formErrors.password }"
              :disabled="loading"
              @input="validateField('password')"
            />
            <p v-if="formErrors.password" class="mt-1 text-sm text-red-500">{{ formErrors.password }}</p>
            <p class="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded-md text-sm">{{ error }}</div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            :disabled="loading || !isFormValid"
          >
            <svg
              v-if="loading"
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
            <span>{{ loading ? 'Creating account...' : 'Sign Up' }}</span>
          </button>

          <!-- Login Link -->
          <div class="text-center text-sm">
            Already have an account?
            <router-link to="/login" class="text-blue-600 hover:text-blue-500 font-medium">Login</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import GlobalNavigation from '../components/GlobalNavigation.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const formErrors = ref({})

const loading = computed(() => auth.loading)
const error = computed(() => auth.error)

const validateField = (field) => {
  formErrors.value[field] = ''

  switch (field) {
    case 'name':
      if (name.value.trim().length < 2) {
        formErrors.value.name = 'Name must be at least 2 characters long'
      }
      break
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        formErrors.value.email = 'Please enter a valid email address'
      }
      break
    case 'password':
      if (password.value.length < 6) {
        formErrors.value.password = 'Password must be at least 6 characters long'
      }
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('email')
  validateField('password')
  return !formErrors.value.name && !formErrors.value.email && !formErrors.value.password
}

const isFormValid = computed(() => {
  return name.value.trim() !== '' && 
         email.value.trim() !== '' && 
         password.value.length >= 6 && 
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

async function handleSubmit() {
  if (!validateForm()) {
    toast.error('Please fix the form errors before submitting')
    return
  }

  try {
    const signupResult = await auth.signup({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value
    })
    
    toast.success('Account created successfully!')
    
    // Use the redirectTo from signup result
    if (signupResult.success && signupResult.redirectTo) {
      router.push(signupResult.redirectTo)
    } else {
      // Fallback routing
      router.push('/packages')
    }
  } catch (err) {
    console.error('Signup error:', err)
    toast.error(err.message || 'Failed to create account')
  }
}
</script>
