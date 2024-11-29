import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SignupView from '../views/SignupView.vue'
import LoginView from '../views/LoginView.vue'
import PaymentView from '../views/PaymentView.vue'
import PremiumPaymentView from '../views/PremiumPaymentView.vue'
import ChatView from '../views/ChatView.vue'
import PackagesView from '../views/PackagesView.vue'
import { useAuthStore } from '../stores/auth'
import { useSubscriptionStore } from '../stores/subscription'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: { guest: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { guest: true },
      beforeEnter: async (to, from, next) => {
        const token = localStorage.getItem('token')

        // If already authenticated, redirect to packages
        if (token) {
          next('/packages')
          return
        }
        
        next()
      }
    },
    {
      path: '/signup',
      name: 'Signup',
      component: SignupView,
      meta: { guest: true },
      beforeEnter: async (to, from, next) => {
        const token = localStorage.getItem('token')

        // If already authenticated, redirect to packages
        if (token) {
          next('/packages')
          return
        }
        
        next()
      }
    },
    {
      path: '/packages',
      name: 'Packages',
      component: PackagesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatView,
      meta: { 
        requiresAuth: true,
        requiresSubscription: true 
      }
    },
    {
      path: '/premium-payment',
      name: 'PremiumPayment',
      component: PremiumPaymentView,
      meta: { 
        requiresAuth: true 
      }
    },
    // Catch-all route
    { 
      path: '/:pathMatch(.*)*', 
      redirect: '/' 
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // Public routes
  const publicRoutes = ['/', '/login', '/signup']
  if (publicRoutes.includes(to.path)) {
    next()
    return
  }

  // Check authentication for protected routes
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // If no token, redirect to login
    if (!token) {
      next('/login')
      return
    }
  }

  // Default: proceed with navigation
  next()
})

export default router
