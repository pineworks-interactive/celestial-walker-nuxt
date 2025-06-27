<script setup lang="ts">
import { computed } from 'vue'
import ZoomLevelBars from '@/components/scene-overlay/zoom-level/ZoomLevelBars.vue'
import { useCamera } from '@/composables/useCamera'
import { useZoomManager } from '@/composables/useZoomManager'
import { colors } from '@/configs/colors.config'
import { controlsConfig } from '@/configs/scene.config'
import { maxZoomLevel, minZoomLevel, zoomThresholds } from '@/configs/zoom.config'

const { zoomLevel } = useZoomManager()
const { cameraDistance } = useCamera()

const maxZoomInThreshold = zoomThresholds[0] // ? 350
const maxZoomOutThreshold = zoomThresholds[zoomThresholds.length - 1] // ? 4300
const maxSceneDistance = controlsConfig.maxDistance // ? 10000

const isMaxZoomIn = computed(() => cameraDistance.value <= maxZoomInThreshold)
const isVoidZoom = computed(() => cameraDistance.value >= maxSceneDistance - 1000)
const isMaxZoomOut = computed(() => cameraDistance.value > maxZoomOutThreshold && !isVoidZoom.value)

const strokeColor = computed(() => {
  if (isVoidZoom.value) {
    return colors.purple
  }
  if (isMaxZoomOut.value) {
    return colors.red
  }
  return colors.springGreen
})
</script>

<template>
  <path d="M1 0L31 41H261L291 0" :stroke="strokeColor" stroke-linecap="round" />
  <text
    x="33"
    y="50"
    :fill="strokeColor"
    font-size="6"
    font-weight="bold"
    stroke="none"
    letter-spacing="0.3em"
  >
    ZOOM LEVEL
  </text>
  <text
    v-if="isVoidZoom"
    x="146"
    y="25"
    :fill="colors.purple"
    font-size="25"
    font-weight="bold"
    letter-spacing="0.3em"
    text-anchor="middle"
    stroke="none"
  >
    VOID
  </text>
  <text
    v-if="isMaxZoomOut"
    x="146"
    y="25"
    :fill="colors.red"
    font-size="20"
    font-weight="bold"
    letter-spacing="0.3em"
    text-anchor="middle"
    stroke="none"
    class="slow-blinking-text"
  >
    OUT OF RANGE
  </text>
  <ZoomLevelBars v-else :zoom-level="zoomLevel" :is-max-zoom-in="isMaxZoomIn" />
</template>

<style scoped>
.slow-blinking-text {
  animation: slow-blink 2s infinite ease-in-out;
}

@keyframes slow-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
