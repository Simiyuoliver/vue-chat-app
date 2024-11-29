import { defineStore } from 'pinia'
import { therapyBot } from '../services/therapyBotService'

const DEFAULT_CHANNEL_AVATAR = 'https://i.pravatar.cc/150?img=3'

export const useChannelStore = defineStore('channels', {
  state: () => ({
    channels: [
      {
        id: 1,
        name: 'Emotional Wellness',
        description: 'Safe space for mental health support and healing',
        messages: [],
        isTherapyChannel: true,
        avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712139.png', // Heart/mental health icon
        therapyFocus: ['Anxiety', 'Depression', 'Stress Management']
      },
      {
        id: 2,
        name: 'Personal Growth',
        description: 'Explore self-improvement and personal development',
        messages: [],
        isTherapyChannel: true,
        avatar: 'https://cdn-icons-png.flaticon.com/512/3456/3456426.png', // Growth/tree icon
        therapyFocus: ['Self-Esteem', 'Goal Setting', 'Mindfulness']
      },
      {
        id: 3,
        name: 'Relationship Support',
        description: 'Guidance for healthy relationships and communication',
        messages: [],
        isTherapyChannel: true,
        avatar: 'https://cdn-icons-png.flaticon.com/512/1998/1998592.png', // Hands/support icon
        therapyFocus: ['Communication', 'Conflict Resolution', 'Intimacy']
      }
    ],
    currentChannelId: 1
  }),

  getters: {
    getCurrentChannel() {
      return (channelId) => {
        return this.channels.find(channel => channel.id === channelId)
      }
    },
    getCurrentChannelMessages() {
      return (channelId) => {
        const channel = this.channels.find(channel => channel.id === channelId)
        return channel ? channel.messages : []
      }
    }
  },

  actions: {
    addMessage(channelId, message) {
      // Find the channel
      const channel = this.channels.find(c => c.id === channelId)
      
      // If channel exists, add the message
      if (channel) {
        // Ensure the messages array exists
        if (!channel.messages) {
          channel.messages = []
        }
        
        // Add the message
        channel.messages.push(message)
        
        // Optional: Log for debugging
        console.log(`Message added to channel ${channelId}:`, message)
        console.log(`Channel messages:`, channel.messages)
      } else {
        console.warn(`Channel with ID ${channelId} not found`)
      }
    },

    processBotResponse(channelId, userMessage) {
      const botResponse = therapyBot.processMessage(userMessage)
      
      const botMessage = {
        id: Date.now(),
        text: botResponse.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }

      this.addMessage(channelId, botMessage)
      return botMessage
    },

    setCurrentChannel(channelId) {
      this.currentChannelId = channelId
    }
  }
})
