<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useChannelStore } from '../stores/channelStore'
import { useAuthStore } from '../stores/auth'
import { therapyBot } from '@/services/therapyBotService'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { useToast } from 'vue-toastification'

// Stores and Routing
const channelStore = useChannelStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

// Reactive State
const messages = ref([])
const newMessage = ref('')
const isLoading = ref(false)
const isSettingsMenuOpen = ref(false)
const isDarkMode = ref(false)
const isNotificationsEnabled = ref(true)
const fileInput = ref(null)
const messagesContainer = ref(null)
const isEmojiPickerVisible = ref(false)
const showEmojiPicker = ref(false)

// Debug logging function
const debugLog = (message, data = null) => {
  console.log(`[ChatView Debug] ${message}`, data)
}

// Enhanced message sending with comprehensive error handling
const sendMessage = async () => {
  // Trim and validate message
  const trimmedMessage = newMessage.value.trim()
  if (!trimmedMessage) {
    debugLog('Empty message, skipping send')
    return
  }

  try {
    // Prevent multiple simultaneous sends
    if (isLoading.value) {
      debugLog('Message send blocked - already loading')
      return
    }

    // Create user message
    const userMessage = {
      id: Date.now(),
      text: trimmedMessage,
      sender: 'user',
      timestamp: new Date()
    }

    // Add user message to chat
    messages.value.push(userMessage)
    
    // Clear input
    newMessage.value = ''
    
    // Set loading state
    isLoading.value = true
    debugLog('Sending message to Therapy Bot', { message: trimmedMessage })

    // Process message through therapy bot
    const botResponse = therapyBot.processMessage(trimmedMessage)

    // Add bot response to messages
    const botMessage = {
      id: Date.now() + 1,
      text: botResponse.response,
      sender: 'bot',
      timestamp: new Date(),
      sentiment: botResponse.sentiment,
      strength: botResponse.strength
    }
    messages.value.push(botMessage)

    // Scroll to bottom
    await nextTick()
    scrollToBottom()
  } catch (error) {
    debugLog('Message send error', error)
    toast.error('Failed to send message. Please try again.', {
      timeout: 3000,
      closeOnClick: true
    })
  } finally {
    // Always reset loading state
    isLoading.value = false
  }
}

// Scroll to bottom of chat
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Emoji selection
const selectEmoji = (emoji) => {
  newMessage.value += emoji.i
  isEmojiPickerVisible.value = false
}

// Keyboard event handler
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Toggle emoji picker
const toggleEmojiPicker = () => {
  isEmojiPickerVisible.value = !isEmojiPickerVisible.value
}

// Handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('File uploaded:', file.name)
    const fileMessage = {
      id: Date.now(),
      text: `Uploaded file: ${file.name}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      file: file
    }
    messages.value.push(fileMessage)
    scrollToBottom()
  }
}

// Lifecycle and initialization
onMounted(() => {
  debugLog('ChatView mounted')
  // Additional initialization if needed
  const channel = channelStore.getCurrentChannel(channelStore.currentChannelId)
  if (channel) {
    const storedMessages = channelStore.getCurrentChannelMessages(channel.id) || []
    
    messages.value = [...storedMessages]
    
    console.log('Mounted - Channel:', channel)
    console.log('Mounted - Stored Messages:', storedMessages)
    console.log('Mounted - Current Messages:', messages.value)
    
    if (messages.value.length > 0) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  }
  // Initial welcome message
  messages.value.push({
    text: "Hello! I'm here to listen and support you. How are you feeling today?",
    sender: 'bot'
  })
})

// Toggle settings menu
const toggleSettingsMenu = () => {
  isSettingsMenuOpen.value = !isSettingsMenuOpen.value
}

// Toggle dark mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
}

// Toggle notifications
const toggleNotifications = () => {
  isNotificationsEnabled.value = !isNotificationsEnabled.value
}

// Logout
const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Open user profile
const openUserProfile = () => {
  router.push('/profile')
}

// Refresh messages
const refreshMessages = () => {
  // Scroll to bottom to ensure latest messages are visible
  nextTick(() => {
    scrollToBottom()
  })

  // Show a toast notification
  toast.success('Chat refreshed', {
    timeout: 2000,
    closeOnClick: true,
    pauseOnHover: true
  })
}

const resetChat = () => {
  messages.value = []
  therapyBot.resetContext()
}

const clearChats = () => {
  // Confirm before clearing chats
  const confirmed = confirm('Are you sure you want to clear all chat messages?')
  
  if (confirmed) {
    // Clear messages
    messages.value = []
    
    // Reset therapy bot context
    therapyBot.resetContext()
    
    // Add initial welcome message
    messages.value.push({
      text: "Hello! I'm here to listen and support you. How are you feeling today?",
      sender: 'bot'
    })
    
    // Show toast notification
    toast.success('Chat messages cleared', {
      timeout: 2000,
      closeOnClick: true,
      pauseOnHover: true
    })
  }
}

// Expose to template
defineExpose({
  messages,
  newMessage,
  isLoading,
  sendMessage,
  selectEmoji,
  handleKeydown,
  toggleEmojiPicker,
  handleFileUpload,
  toggleSettingsMenu,
  toggleDarkMode,
  toggleNotifications,
  logout,
  openUserProfile,
  refreshMessages,
  resetChat,
  clearChats
})
</script>

<template>
  <div class="chat-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="chat-header">
      <div class="header-left">
        <img :src="channelStore.getCurrentChannel(channelStore.currentChannelId).avatar" :alt="channelStore.getCurrentChannel(channelStore.currentChannelId).name" class="channel-avatar">
        <div class="channel-info">
          <h2>{{ channelStore.getCurrentChannel(channelStore.currentChannelId).name }}</h2>
          <p class="channel-description">{{ channelStore.getCurrentChannel(channelStore.currentChannelId).description }}</p>
          <div v-if="channelStore.getCurrentChannel(channelStore.currentChannelId).therapyFocus" class="therapy-focus">
            <span class="focus-label">Focus Areas:</span>
            <span 
              v-for="(focus, index) in channelStore.getCurrentChannel(channelStore.currentChannelId).therapyFocus" 
              :key="focus" 
              class="focus-tag"
            >
              {{ focus }}{{ index < channelStore.getCurrentChannel(channelStore.currentChannelId).therapyFocus.length - 1 ? ' • ' : '' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="header-right">
        <div class="user-actions">
          <button @click="refreshMessages" class="refresh-btn">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button @click="clearChats" class="clear-btn">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button @click="toggleSettingsMenu" class="settings-btn">
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Settings Dropdown -->
    <div v-if="isSettingsMenuOpen" class="settings-dropdown">
      <div class="settings-item" @click="openUserProfile">
        <i class="fas fa-user"></i> Profile
      </div>
      <div class="settings-item" @click="toggleDarkMode">
        <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i> 
        {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
      </div>
      <div class="settings-item" @click="toggleNotifications">
        <i :class="isNotificationsEnabled ? 'fas fa-bell-slash' : 'fas fa-bell'"></i>
        {{ isNotificationsEnabled ? 'Disable' : 'Enable' }} Notifications
      </div>
      <div class="settings-item logout" @click="logout">
        <i class="fas fa-sign-out-alt"></i> Logout
      </div>
      <div class="settings-item" @click="clearChats">
        <i class="fas fa-trash-alt"></i> Clear Chats
      </div>
    </div>
    
    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        :class="['message', message.sender === 'user' ? 'user-message' : 'bot-message']"
      >
        <template v-if="message.sender === 'bot'">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4712/4712139.png" 
            alt="Therapy Bot" 
            class="bot-avatar"
          />
          <div class="message-content bot-message">
            <p>{{ message.text }}</p>
            <div 
              v-if="message.sentiment" 
              class="message-sentiment"
            >
              <span class="sentiment-label">Sentiment:</span>
              <span 
                class="sentiment-tag" 
                :class="{
                  'positive': message.sentiment === 'positive',
                  'negative': ['depression', 'anxiety', 'anger', 'grief'].includes(message.sentiment)
                }"
              >
                {{ message.sentiment }} 
                <span class="sentiment-strength">
                  (Intensity: {{ (message.strength * 100).toFixed(0) }}%)
                </span>
              </span>
            </div>
            <small class="message-timestamp">
              {{ new Date(message.timestamp).toLocaleTimeString() }}
            </small>
          </div>
        </template>
        <template v-else>
          <div class="message-content">
            <template v-if="message.file">
              <span>📄 {{ message.text }}</span>
            </template>
            <template v-else>
              {{ message.text }}
            </template>
            <template v-if="message.sentiment">
              <span class="sentiment-tag" :class="{ 'positive': message.sentiment === 'positive', 'negative': message.sentiment === 'negative' }">
                {{ message.sentiment }} ({{ message.strength }})
              </span>
            </template>
          </div>
          <div class="message-timestamp">
            {{ new Date(message.timestamp).toLocaleTimeString() }}
          </div>
        </template>
      </div>
    </div>

    <div class="message-input-container">
      <input 
        type="file" 
        ref="fileInput" 
        style="display: none" 
        @change="handleFileUpload"
        accept="image/*,application/pdf,.doc,.docx"
      >
      <button @click="fileInput.click()" class="file-upload-btn">
        <i class="fas fa-paperclip"></i>
      </button>
      
      <div class="emoji-toggle-btn" @click="toggleEmojiPicker">
        <i class="far fa-smile"></i>
      </div>
      
      <div v-if="isEmojiPickerVisible" class="emoji-picker-wrapper">
        <EmojiPicker 
          :native="true" 
          @select="selectEmoji"
          :search="true"
          :i18n="{
            search: 'Search',
            notfound: 'No Emoji Found',
            categories: {
              search: 'Search Results',
              recent: 'Frequently Used',
              smileys: 'Smileys and Emotions',
              animals: 'Animals',
              food: 'Food',
              objects: 'Objects',
              flags: 'Flags',
              symbols: 'Symbols',
              gestures: 'Gestures and Body Parts'
            }
          }"
        />
      </div>
      
      <input 
        v-model="newMessage" 
        @keyup.enter="sendMessage"
        placeholder="Type a message..." 
        class="message-input"
      >
      
      <button @click="sendMessage" class="send-btn">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --background-light: #f4f7f6;
  --background-dark: #121212;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-color: #ecf0f1;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  background-color: var(--background-light);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  transition: all 0.3s ease;
  overflow: hidden;
}

.dark-mode {
  background-color: var(--background-dark);
  color: #ffffff;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.dark-mode .chat-header {
  background-color: #1e1e1e;
  border-bottom-color: #333;
}

.header-left {
  display: flex;
  align-items: center;
}

.channel-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
  border: 2px solid var(--primary-color);
  transition: transform 0.3s ease;
}

.channel-avatar:hover {
  transform: scale(1.1);
}

.channel-info {
  display: flex;
  flex-direction: column;
}

.channel-info h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.dark-mode .channel-info h2 {
  color: #ffffff;
}

.channel-description {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.dark-mode .channel-description {
  color: #a0a0a0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-actions {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 30px;
  padding: 0.25rem 0.5rem;
  transition: background-color 0.3s ease;
}

.dark-mode .user-actions {
  background-color: rgba(255, 255, 255, 0.1);
}

.settings-btn, .refresh-btn, .clear-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  margin: 0 0.25rem;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn:hover, .refresh-btn:hover, .clear-btn:hover {
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
  transform: scale(1.1) rotate(15deg);
}

.dark-mode .settings-btn, .dark-mode .refresh-btn, .dark-mode .clear-btn {
  color: #a0a0a0;
}

.dark-mode .settings-btn:hover, .dark-mode .refresh-btn:hover, .dark-mode .clear-btn:hover {
  background-color: rgba(52, 152, 219, 0.2);
  color: var(--primary-color);
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 10px;
}

.message {
  max-width: 75%;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInMessage 0.5s forwards;
}

@keyframes fadeInMessage {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  align-self: flex-end;
  background: linear-gradient(135deg, #f1f2f6, #e0e0e0);
  color: black;
  border-radius: 15px 15px 0 15px;
  padding: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.dark-mode .user-message {
  background: linear-gradient(135deg, #2c2c2c, #1e1e1e);
  color: white;
}

.bot-message {
  align-self: flex-start;
  background: linear-gradient(135deg, #f1f2f6, #e0e0e0);
  color: black;
  border-radius: 15px 15px 15px 0;
  padding: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.dark-mode .bot-message {
  background: linear-gradient(135deg, #2c2c2c, #1e1e1e);
  color: white;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.4;
  color: black;
}

.message-timestamp {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  align-self: flex-end;
  margin-top: 0.25rem;
}

.dark-mode .message-timestamp {
  color: rgba(255, 255, 255, 0.5);
}

.sentiment-tag {
  font-size: 0.6rem;
  margin-left: 0.5rem;
  padding: 0.1rem 0.3rem;
  border-radius: 10px;
}

.positive {
  background-color: #c6efce;
  color: #2ecc71;
}

.negative {
  background-color: #ffc6c6;
  color: #e74c3c;
}

.message-input-container {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: white;
  border-top: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.dark-mode .message-input-container {
  background-color: #1e1e1e;
  border-top-color: #333;
}

.file-upload-btn, .emoji-toggle-btn, .send-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  margin: 0 0.5rem;
  transition: color 0.3s ease, transform 0.2s ease;
}

.file-upload-btn:hover, 
.emoji-toggle-btn:hover, 
.send-btn:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

.refresh-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  margin: 0 0.5rem;
  transition: color 0.3s ease, transform 0.2s ease;
}

.refresh-btn:hover {
  color: var(--primary-color);
  transform: rotate(180deg);
}

.dark-mode .refresh-btn {
  color: #a0a0a0;
}

.dark-mode .refresh-btn:hover {
  color: var(--primary-color);
}

.message-input {
  flex-grow: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 25px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.settings-dropdown {
  position: absolute;
  top: 80px;
  right: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 250px;
  z-index: 100;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.dark-mode .settings-dropdown {
  background-color: #2c2c2c;
  border-color: #444;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.settings-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-mode .settings-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.settings-item i {
  margin-right: 10px;
  color: var(--text-secondary);
}

.settings-item.logout {
  color: #e74c3c;
  border-top: 1px solid var(--border-color);
}

.dark-mode .settings-item.logout {
  color: #ff6b6b;
  border-top-color: #444;
}

.emoji-picker-wrapper {
  position: absolute;
  bottom: 100%;
  right: 60px;
  z-index: 10;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.therapy-focus {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.focus-label {
  color: var(--text-secondary);
  margin-right: 0.5rem;
  font-weight: 600;
}

.focus-tag {
  color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 15px;
  margin-right: 0.3rem;
}

.dark-mode .focus-tag {
  color: #ffffff;
  background-color: rgba(52, 152, 219, 0.2);
}

.bot-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-sentiment {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.sentiment-label {
  color: var(--text-secondary);
  margin-right: 0.5rem;
  font-weight: 600;
}

.sentiment-strength {
  font-size: 0.6rem;
  color: var(--text-secondary);
}
</style>