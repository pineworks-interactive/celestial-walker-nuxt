<script setup lang="ts">
import ZoomLevelBars from '@/components/scene-overlay/zoom-level/ZoomLevelBars.vue'
import { useZoomManager } from '@/composables/useZoomManager'
import { colors } from '@/configs/colors.config'

const { zoomLevel } = useZoomManager()
</script>

<template>
  <path d="M1 0L31 41H261L291 0" :stroke="colors.springGreen" stroke-linecap="round" />
  <ZoomLevelBars :zoom-level="zoomLevel" />
</template>

<style scoped>

</style>
