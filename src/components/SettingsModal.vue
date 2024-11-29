<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
    @click.self="closeModal"
  >
    <div 
      class="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out"
    >
      <!-- Modal Header -->
      <div class="p-6 border-b dark:border-dark-700 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-dark-primary">
          Settings
        </h2>
        <button 
          @click="closeModal" 
          class="text-gray-600 dark:text-dark-secondary hover:text-gray-800 dark:hover:text-dark-primary"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 space-y-6">
        <!-- Theme Section -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700 dark:text-dark-primary mb-4">
            Theme Preferences
          </h3>
          <div class="grid grid-cols-3 gap-4">
            <button 
              v-for="(theme, index) in themeOptions" 
              :key="index"
              @click="selectTheme(theme.value)"
              :class="{
                'border-2 border-blue-600 dark:border-blue-400': currentTheme === theme.value,
                'hover:bg-gray-100 dark:hover:bg-dark-700': currentTheme !== theme.value
              }"
              class="flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 ease-in-out"
            >
              <div 
                :class="theme.bgClass" 
                class="w-16 h-16 rounded-lg mb-2 flex items-center justify-center"
              >
                <i :class="theme.icon" class="text-2xl"></i>
              </div>
              <span class="text-sm text-gray-700 dark:text-dark-primary">
                {{ theme.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Notification Preferences -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700 dark:text-dark-primary mb-4">
            Notifications
          </h3>
          <div class="space-y-4">
            <label class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-dark-primary">
                Desktop Notifications
              </span>
              <div class="relative">
                <input 
                  type="checkbox" 
                  v-model="desktopNotifications"
                  class="sr-only peer"
                  id="desktop-notifications"
                >
                <label 
                  for="desktop-notifications" 
                  class="
                    w-12 h-6 bg-gray-200 dark:bg-dark-700 
                    peer-checked:bg-blue-600 dark:peer-checked:bg-blue-400
                    rounded-full 
                    cursor-pointer 
                    relative 
                    transition-colors 
                    duration-300
                    after:content-[''] 
                    after:absolute 
                    after:top-0.5 
                    after:left-0.5 
                    after:bg-white 
                    after:w-5 
                    after:h-5 
                    after:rounded-full 
                    after:shadow 
                    after:transform 
                    after:transition-transform 
                    peer-checked:after:translate-x-6
                  "
                ></label>
              </div>
            </label>
            <label class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-dark-primary">
                Sound Notifications
              </span>
              <div class="relative">
                <input 
                  type="checkbox" 
                  v-model="soundNotifications"
                  class="sr-only peer"
                  id="sound-notifications"
                >
                <label 
                  for="sound-notifications" 
                  class="
                    w-12 h-6 bg-gray-200 dark:bg-dark-700 
                    peer-checked:bg-blue-600 dark:peer-checked:bg-blue-400
                    rounded-full 
                    cursor-pointer 
                    relative 
                    transition-colors 
                    duration-300
                    after:content-[''] 
                    after:absolute 
                    after:top-0.5 
                    after:left-0.5 
                    after:bg-white 
                    after:w-5 
                    after:h-5 
                    after:rounded-full 
                    after:shadow 
                    after:transform 
                    after:transition-transform 
                    peer-checked:after:translate-x-6
                  "
                ></label>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-6 border-t dark:border-dark-700 flex justify-end space-x-4">
        <button 
          @click="closeModal" 
          class="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-primary rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="saveSettings" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import ProfileImageUploader from './ProfileImageUploader.vue'

const emit = defineEmits(['close'])
const toast = useToast()

// Theme Options
const themeOptions = [
  { 
    value: 'light', 
    label: 'Light', 
    icon: 'fas fa-sun', 
    bgClass: 'bg-yellow-100'
  },
  { 
    value: 'dark', 
    label: 'Dark', 
    icon: 'fas fa-moon', 
    bgClass: 'bg-gray-800'
  },
  { 
    value: 'system', 
    label: 'System', 
    icon: 'fas fa-desktop', 
    bgClass: 'bg-blue-100'
  }
]

// Current Theme
const currentTheme = ref(localStorage.getItem('theme') || 'system')

// Notification Toggles
const desktopNotifications = ref(
  JSON.parse(localStorage.getItem('desktopNotifications') || 'false')
)
const soundNotifications = ref(
  JSON.parse(localStorage.getItem('soundNotifications') || 'false')
)

// Theme Selection Method
const selectTheme = (theme) => {
  currentTheme.value = theme
  
  // Apply theme
  if (theme === 'light') {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  } else if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    document.documentElement.classList.toggle('dark', prefersDark.matches)
    localStorage.removeItem('theme')
  }
}

// Save Settings Method
const saveSettings = () => {
  // Save notification preferences
  localStorage.setItem('desktopNotifications', desktopNotifications.value)
  localStorage.setItem('soundNotifications', soundNotifications.value)

  toast.success('Settings saved successfully!')
  closeModal()
}

// Close Modal Method
const closeModal = () => {
  emit('close')
}

// Lifecycle Hook
onMounted(() => {
  // Initial theme setup
  selectTheme(currentTheme.value)
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
