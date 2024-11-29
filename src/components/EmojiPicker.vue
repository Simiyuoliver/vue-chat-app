<template>
  <div 
    class="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-dark-800 rounded-lg shadow-lg border dark:border-dark-700 p-2"
  >
    <div class="grid grid-cols-6 gap-2">
      <button 
        v-for="emoji in emojis" 
        :key="emoji"
        @click="selectEmoji(emoji)"
        class="text-2xl hover:bg-gray-100 dark:hover:bg-dark-700 rounded p-1 transition-colors"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  commonEmojis: {
    type: Array,
    default: () => ['😀', '😍', '👍', '❤️', '🎉', '👏', '😂', '🤔', '🙌']
  }
})

const emits = defineEmits(['select'])

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', 
  '😂', '🤣', '😊', '😇', '🙂', '🙃', 
  '😉', '😌', '😍', '🥰', '😘', '😗',
  '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟',
  '😕', '🙁', '☹️', '😣', '😖', '😫',
  '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶',
  '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐',
  '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪',
  '😵', '🤐', '🥴', '🤢', '🤮', '🤧',
  '😷', '🤒', '🤕', '🤑', '🤠', '😈'
]

const selectEmoji = (emoji) => {
  emits('select', emoji)
}
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>
