<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Home Button -->
        <router-link 
          to="/" 
          class="flex items-center text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-8 w-8 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          Vue Chat
        </router-link>
        
        <!-- Default Navigation Links or Slot Content -->
        <div class="flex items-center space-x-4">
          <slot name="right">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </router-link>
            
            <!-- Additional links can be added here -->
            <div class="global-navigation">
              <div 
                class="user-icon-container" 
                @click="toggleUserInfo"
              >
                <img 
                  :src="userProfile?.avatar || '/default-avatar.png'" 
                  alt="User Avatar" 
                  class="user-icon"
                />
                <span 
                  v-if="userPlan === 'free'" 
                  class="free-plan-badge"
                >
                  Free
                </span>
              </div>

              <div 
                v-if="showUserInfo" 
                class="user-info-dropdown"
              >
                <div class="user-info-header">
                  <div class="avatar-container">
                    <img 
                      :src="userProfile?.avatar || '/default-avatar.png'" 
                      alt="User Avatar" 
                      class="dropdown-avatar"
                    />
                    <span 
                      v-if="userPlan === 'free'" 
                      class="free-plan-badge-dropdown"
                    >
                      Free Plan
                    </span>
                  </div>
                  <div class="user-details">
                    <h3>{{ userProfile?.username || 'User' }}</h3>
                    <p>{{ userProfile?.email || 'No email' }}</p>
                  </div>
                </div>

                <div class="user-info-actions">
                  <div 
                    class="action-item" 
                    @click="$router.push('/profile')"
                  >
                    <i class="fas fa-user"></i> Edit Profile
                  </div>
                  <div 
                    class="action-item upgrade-plan" 
                    @click="$router.push('/packages')"
                  >
                    <i class="fas fa-crown"></i> Upgrade Plan
                  </div>
                  <div 
                    class="action-item logout" 
                    @click="logout"
                  >
                    <i class="fas fa-sign-out-alt"></i> Logout
                  </div>
                </div>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const showUserInfo = ref(false)

const toggleUserInfo = () => {
  showUserInfo.value = !showUserInfo.value
}

const userProfile = computed(() => authStore.user)
const userPlan = computed(() => {
  // Assuming the plan is stored in the user object
  return authStore.user?.plan || 'free'
})

const isAuthenticated = computed(() => authStore.isAuthenticated)

const logout = () => {
  authStore.logout()
  toast.success('Logged out successfully')
  router.push('/login')
}
</script>

<style scoped>
nav {
  position: sticky;
  top: 0;
  z-index: 50;
}

.global-navigation {
  position: relative;
}

.user-icon-container {
  cursor: pointer;
  position: relative;
}

.user-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-color);
  transition: transform 0.3s ease;
}

.user-icon:hover {
  transform: scale(1.1);
}

.free-plan-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #f39c12;
  color: white;
  font-size: 0.6rem;
  padding: 2px 5px;
  border-radius: 10px;
  font-weight: bold;
}

.avatar-container {
  position: relative;
}

.free-plan-badge-dropdown {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f39c12;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.user-info-dropdown {
  position: absolute;
  top: 60px;
  right: 0;
  width: 250px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.dark-mode .user-info-dropdown {
  background-color: #2c2c2c;
  border-color: #444;
}

.user-info-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.user-details h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.user-details p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.user-info-actions {
  padding: 10px 0;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-mode .action-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.action-item i {
  margin-right: 10px;
  color: var(--text-secondary);
}

.action-item.logout {
  color: #e74c3c;
  border-top: 1px solid var(--border-color);
}

.action-item.upgrade-plan {
  color: #f39c12;
}
</style>
