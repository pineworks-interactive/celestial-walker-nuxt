<script setup lang="ts">
import { colors } from '@/configs/colors.config'
</script>

<template>
  <div class="exit-prompt">
    Press SPACE to exit
  </div>
</template>

<style scoped>
.exit-prompt {
  color: v-bind('colors.springGreen');
  font-family: system-ui, sans-serif;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 0 10px v-bind('colors.springGreen');
  animation: blink-animation 2s infinite ease-in-out;
  pointer-events: none; /* No interaction needed */
  white-space: nowrap;
  letter-spacing: 0.1em;
}

@keyframes blink-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}
</style>
