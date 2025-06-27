<script setup lang="ts">
import { colors } from '@/configs/colors.config'

function onToggle() {
  console.warn('Toggle Info Window')
  // TODO: Implement info window toggle logic
}
</script>

<template>
  <button
    class="pointer-events-auto cursor-pointer rounded border border-[#00ff9f] bg-[#00ff9f]/70 px-3 py-1 text-xs font-semibold text-[#002b20] transition-all hover:bg-[#00ff9f] hover:shadow-[0_0_15px_#00ff9f] md:px-4 md:py-2 md:text-base"
    @click="onToggle"
  >
    INFO
  </button>
</template>

<style scoped>
.floating-button {
  background-color: transparent;
  border: 1px solid v-bind('colors.springGreen');
  color: v-bind('colors.springGreen');
  padding: 8px 16px;
  font-family: system-ui, sans-serif;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  pointer-events: auto; /* Allow clicks */
  transition: all 0.2s ease;
  white-space: nowrap;
}

.floating-button:hover {
  background-color: v-bind('colors.springGreen');
  color: v-bind('colors.black');
  box-shadow: 0 0 15px v-bind('colors.springGreen');
}
</style>
