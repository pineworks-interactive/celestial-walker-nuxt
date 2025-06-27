<script setup lang="ts">
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { computed } from 'vue'
import { colors } from '@/configs/colors.config'

interface Props {
  body: CelestialBodyState | null
}

const props = defineProps<Props>()

// This is a placeholder for a more complex SVG based on the body's ID.
const identifierText = computed(() => {
  if (!props.body)
    return ''
  return `ID: ${props.body.name.toUpperCase()}`
})
</script>

<template>
  <div class="identifier-container">
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" :stroke="colors.springGreen" stroke-width="4" />
      <text x="50" y="55" text-anchor="middle" :fill="colors.springGreen" font-size="12" font-weight="bold">{{ identifierText }}</text>
    </svg>
  </div>
</template>

<style scoped>
.identifier-container {
  pointer-events: none;
  color: v-bind('colors.springGreen');
  font-family: system-ui, sans-serif;
}
</style>
