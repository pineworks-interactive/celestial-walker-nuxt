<script setup lang="ts">
import { computed } from 'vue'
import { hoveredBody } from '@/composables/interactionState'
import { colors } from '@/configs/colors.config'

const targetName = computed(() => hoveredBody.value?.name || 'Target')
</script>

<template>
  <g>
    <path
      d="M0 0H240.086L280 40H40L0 0Z"
      :stroke="colors.springGreen"
    />
    <path
      d="M0 30V40H10"
      :stroke="colors.springGreen"
      stroke-opacity="0.5"
      stroke-width="3"
      stroke-linecap="square"
    />
    <text x="20" y="25" class="target-text">
      {{ targetName.toUpperCase() }}
    </text>
  </g>
</template>

<style scoped>
.target-text {
  fill: v-bind('colors.springGreen');
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  font-size: 16px;
  font-weight: 600;
  user-select: none;
  letter-spacing: 0.1em;
}
</style>
