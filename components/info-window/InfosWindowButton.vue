<script setup lang="ts">
import { isInfoWindowOpen } from '~/composables/state/interactionState'
import { colors } from '@/configs/colors.config'

function onToggle(event: MouseEvent) {
  // Prevent the click from propagating to the canvas behind
  event.stopPropagation()
  event.preventDefault()

  isInfoWindowOpen.value = !isInfoWindowOpen.value
}
</script>

<template>
  <button
    class="floating-button"
    @click="onToggle"
  >
    WANT TO KNOW MORE?
  </button>
</template>

<style scoped>
.floating-button {
  background-color: transparent;
  border: 1px solid v-bind('colors.springGreen');
  border-radius: 0.25rem;
  padding: 0.25rem 0.75rem;
  color: v-bind('colors.springGreen');
  font-family: system-ui, sans-serif;
  font-weight: 600;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.1s ease;
  white-space: nowrap;
}

.floating-button:hover {
  background-color: v-bind('colors.shadowedSpringGreen');
  color: v-bind('colors.springGreen');
  box-shadow: 0 0 15px v-bind('colors.springGreen');
}

@media (min-width: 768px) {
  .floating-button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
}
</style>
