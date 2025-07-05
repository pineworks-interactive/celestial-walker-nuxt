<script setup lang="ts">
import { computed } from 'vue'
import { hoveredBody, selectedBody } from '~/composables/state/interactionState'
import { colors } from '@/configs/colors.config'

const targetName = computed(() => selectedBody.value?.name || hoveredBody.value?.name || 'Target')
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
    <transition name="fade-text" mode="out-in">
      <text
        :key="targetName"
        x="140"
        y="22"
        class="target-text"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ targetName.toUpperCase() }}
      </text>
    </transition>
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
  font-size: 20px;
  font-weight: 600;
  user-select: none;
  letter-spacing: 0.3em;
}

.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.3s ease;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}
</style>
