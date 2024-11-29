<template>
  <div class="relative">
    <!-- Profile Image -->
    <div 
      class="
        relative 
        w-32 
        h-32 
        mx-auto 
        rounded-full 
        border-4 
        border-white 
        dark:border-dark-700 
        shadow-lg 
        overflow-hidden 
        group
      "
    >
      <!-- Current Avatar -->
      <img 
        :src="currentAvatar" 
        alt="Profile Avatar" 
        class="
          w-full 
          h-full 
          object-cover 
          transition-opacity 
          duration-300 
          group-hover:opacity-50
        "
      >
      
      <!-- Hover Overlay -->
      <div 
        class="
          absolute 
          inset-0 
          bg-black 
          bg-opacity-0 
          group-hover:bg-opacity-50 
          flex 
          items-center 
          justify-center 
          transition-all 
          duration-300
        "
      >
        <button 
          @click="triggerFileInput" 
          class="
            text-white 
            opacity-0 
            group-hover:opacity-100 
            transition-opacity 
            duration-300 
            flex 
            flex-col 
            items-center
          "
        >
          <i class="fas fa-camera text-2xl mb-2"></i>
          <span class="text-sm">Change</span>
        </button>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept="image/jpeg,image/png,image/gif,image/webp"
      @change="handleFileUpload"
    >

    <!-- Image Preview Modal -->
    <div 
      v-if="previewImage" 
      class="
        fixed 
        inset-0 
        bg-black 
        bg-opacity-75 
        z-50 
        flex 
        items-center 
        justify-center 
        p-4
      "
      @click.self="cancelPreview"
    >
      <div class="max-w-xl w-full bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-2xl">
        <!-- Preview Image -->
        <img 
          :src="previewImage" 
          alt="Image Preview" 
          class="w-full max-h-[70vh] object-contain"
        >

        <!-- Actions -->
        <div class="p-4 bg-gray-100 dark:bg-dark-700 flex justify-between">
          <button 
            @click="cancelPreview" 
            class="
              px-4 
              py-2 
              bg-gray-200 
              dark:bg-dark-600 
              text-gray-700 
              dark:text-dark-primary 
              rounded-lg 
              hover:bg-gray-300 
              dark:hover:bg-dark-500
            "
          >
            Cancel
          </button>
          <button 
            @click="uploadImage" 
            class="
              px-4 
              py-2 
              bg-blue-600 
              text-white 
              rounded-lg 
              hover:bg-blue-700 
              transition-colors
            "
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

// File input reference
const fileInput = ref(null)

// Image states
const previewImage = ref(null)
const selectedFile = ref(null)

// Current avatar computation
const currentAvatar = computed(() => 
  authStore.currentUser?.avatar || '/default-avatar.png'
)

// Trigger file input
const triggerFileInput = () => {
  fileInput.value.click()
}

// Handle file selection
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  
  if (!file) return

  // Validate file
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).')
    return
  }

  if (file.size > maxSize) {
    toast.error('File is too large. Maximum file size is 5MB.')
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
    selectedFile.value = file
  }
  reader.readAsDataURL(file)
}

// Upload image
const uploadImage = async () => {
  if (!selectedFile.value) {
    toast.error('No image selected')
    return
  }

  try {
    await authStore.uploadProfileImage(selectedFile.value)
    toast.success('Profile image updated successfully!')
    previewImage.value = null
    selectedFile.value = null
  } catch (error) {
    toast.error(error.message || 'Failed to upload profile image')
  }
}

// Cancel preview
const cancelPreview = () => {
  previewImage.value = null
  selectedFile.value = null
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
