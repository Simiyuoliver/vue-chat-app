import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/main.css'
import './index.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { usePaymentStore } from './stores/payment'

const app = createApp(App)
const pinia = createPinia()

const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: 'button',
  icon: true,
  rtl: false
}

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Initialize stores after pinia is installed
const authStore = useAuthStore()
const paymentStore = usePaymentStore()

app.mount('#app')
