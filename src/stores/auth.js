import { defineStore } from 'pinia';
import axios from 'axios'; // Import axios

const API_URL = import.meta.env.VITE_API_URL;

// Set default avatar on store initialization
const defaultAvatarUrl = 'https://i.pravatar.cc/150?img=5'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || { 
      avatar: defaultAvatarUrl,
      name: 'User',
      email: 'user@example.com'
    },
    token: localStorage.getItem('token') || null,
    error: null,
    loading: false,
    isAuthenticated: false
  }),

  actions: {
    async signup(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Validate input
        if (!this.validateSignupData(userData)) {
          throw new Error('Invalid signup information');
        }

        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Signup failed');
        }

        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Clear any existing subscription to force package selection
        localStorage.removeItem('subscription');
        
        return { 
          success: true, 
          redirectTo: '/packages' // Explicitly redirect to packages page after signup
        };
      } catch (error) {
        console.error('Detailed Signup Error:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
        
        if (response.data.token) {
          this.token = response.data.token
          this.user = response.data.user
          this.isAuthenticated = true
          
          // Store token and user in localStorage
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          
          // Return a flag indicating successful login
          return { 
            success: true, 
            redirectTo: '/login' // Explicitly redirect to login page
          }
        }
        
        return { success: false, message: 'Login failed' }
      } catch (error) {
        console.error('Login error:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'An error occurred during login' 
        }
      }
    },

    async refreshToken() {
      try {
        if (!this.token) return null;

        const response = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (response.ok) {
          this.token = data.token;
          localStorage.setItem('token', this.token);
          return data.token;
        } else {
          this.logout();
          return null;
        }
      } catch (error) {
        console.error('Token Refresh Error:', error);
        this.logout();
        return null;
      }
    },

    logout() {
      // Clear authentication state
      this.token = null
      this.user = null
      this.isAuthenticated = false

      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('subscription')
    },

    async updateSubscription(subscriptionData) {
      try {
        // Validate input
        if (!subscriptionData || !subscriptionData.planType) {
          throw new Error('Invalid subscription data');
        }

        // If user is not authenticated, throw an error
        if (!this.isAuthenticated) {
          throw new Error('User must be logged in to update subscription');
        }

        // Optional: Send subscription update to backend if needed
        const response = await fetch(`${API_URL}/api/user/subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            userId: this.user.id,
            ...subscriptionData
          })
        });

        const data = await response.ok ? await response.json() : subscriptionData;

        // Update local storage with subscription info
        const subscription = {
          planType: subscriptionData.planType,
          paymentProcessed: subscriptionData.paymentProcessed || false,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem('subscription', JSON.stringify(subscription));

        return subscription;
      } catch (error) {
        console.error('Subscription Update Error:', error);
        throw error;
      }
    },

    getSubscription() {
      const storedSubscription = localStorage.getItem('subscription');
      return storedSubscription ? JSON.parse(storedSubscription) : null;
    },

    async uploadProfileImage(file) {
      try {
        // Validate file
        if (!file) {
          throw new Error('No file selected')
        }

        // File type and size validation
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!validTypes.includes(file.type)) {
          throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).')
        }

        if (file.size > maxSize) {
          throw new Error('File is too large. Maximum file size is 5MB.')
        }

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('avatar', file)

        // Send file to backend
        const response = await fetch(`${API_URL}/api/users/upload-avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to upload profile image')
        }

        // Parse response
        const data = await response.json()

        // Update user in store and localStorage
        this.user = {
          ...this.user,
          avatar: data.avatarUrl
        }
        localStorage.setItem('user', JSON.stringify(this.user))

        return data.avatarUrl
      } catch (error) {
        console.error('Profile Image Upload Error:', error)
        throw error
      }
    },

    updateAvatar(avatarUrl) {
      try {
        // Validate URL
        if (!avatarUrl || typeof avatarUrl !== 'string') {
          throw new Error('Invalid avatar URL')
        }

        // Update user in store
        this.user = {
          ...this.user,
          avatar: avatarUrl
        }

        // Persist in localStorage
        localStorage.setItem('user', JSON.stringify(this.user))

        return avatarUrl
      } catch (error) {
        console.error('Avatar Update Error:', error)
        throw error
      }
    },

    // Input validation methods
    validateSignupData(userData) {
      return userData.name && 
             userData.email && 
             this.isValidEmail(userData.email) && 
             userData.password && 
             userData.password.length >= 6;
    },

    validateLoginData(credentials) {
      return credentials.email && 
             this.isValidEmail(credentials.email) && 
             credentials.password;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  },

  getters: {
    currentUser: (state) => state.user
  }
})
