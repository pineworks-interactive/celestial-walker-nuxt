<script setup lang="ts">
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { computed } from 'vue'
import { colors } from '@/configs/colors.config'

interface Props {
  body: CelestialBodyState | null
}

const props = defineProps<Props>()

const symbols = {
  sun: '<svg width="16" height="16" viewBox="0 0 12 12"><path style="fill:currentColor;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M6 5.102a.899.899 0 1 0 0 1.797.899.899 0 0 0 0-1.797Z"/><path style="fill:none;stroke:currentColor;stroke-width:6;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-opacity:1" d="M110 60c0 27.617-22.383 50-50 50S10 87.617 10 60s22.383-50 50-50 50 22.383 50 50z" transform="matrix(.1 0 0 -.1 0 12)"/></svg>',
  mercury: '<svg width="16" height="16" viewBox="0 0 12 12"><path d="M8 5a1.999 1.999 0 1 0-4 0 1.999 1.999 0 1 0 4 0ZM4 1a1.999 1.999 0 1 0 4 0M6 11V7M4 9h4" style="fill:none;stroke:currentColor;stroke-width:.6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-opacity:1;stroke-dasharray:none"/></svg>',
  venus: '<svg width="16" height="16" viewBox="0 0 12 12"><path style="fill:none;stroke:currentColor;stroke-width:.6;stroke-miterlimit:4;stroke-dasharray:none;stroke-linejoin:round;stroke-linecap:round" d="M6 11V7M4 9h4m1-5a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3Z"/></svg>',
  earth: '<svg width="16" height="16" viewBox="0 0 12 12"><path style="fill:none;stroke:currentColor;stroke-width:.6;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M11 6A5 5 0 1 0 1 6a5 5 0 0 0 10 0zm-5 5V1M1 6h10"/></svg>',
  moon: '<svg width="16" height="16" viewBox="0 0 12 12"><path d="M8.5 1a5 5 0 1 0 0 10C6.715 9.969 5.613 8.062 5.613 6S6.715 2.031 8.5 1Zm0 0" style="fill:none;stroke:currentColor;stroke-width:.6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;stroke-opacity:1;stroke-dasharray:none"/></svg>',
  mars: '<svg width="16" height="16" viewBox="0 0 12 12"><path d="M9 7c0-2.207-1.793-4-4-4S1 4.793 1 7s1.793 4 4 4 4-1.793 4-4ZM7.828 4.172 11 1M9.23 1H11v1.77" style="fill:none;stroke:currentColor;stroke-width:.6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-opacity:1;stroke-dasharray:none"/></svg>',
} as const

type SymbolKey = keyof typeof symbols

/**
 * ~ Type guard that checks if a string is a valid key of the symbols object
 * @param key The key to validate.
 * @returns True if the key is a valid SymbolKey.
 */
function isValidSymbolKey(key: string | undefined | null): key is SymbolKey {
  if (!key)
    return false
  return key in symbols
}

const symbolSvg = computed(() => {
  const bodyId = props.body?.id
  if (isValidSymbolKey(bodyId)) {
    return symbols[bodyId]
  }
  return ''
})
</script>

<template>
  <div v-if="symbolSvg" class="symbol-container" v-html="symbolSvg" />
</template>

<style scoped>
.symbol-container {
  pointer-events: none;
  color: v-bind('colors.springGreen');
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.symbol-container :deep(svg) {
  width: 60%;
  height: 60%;
}
</style>
