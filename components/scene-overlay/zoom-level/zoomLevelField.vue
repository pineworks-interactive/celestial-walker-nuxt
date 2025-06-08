<script setup lang="ts">
import ZoomLevelBars from './zoomLevelBars.vue'
import { useZoomManager } from '@/composables/useZoomManager'

const { zoomLevel } = useZoomManager()
</script>

<template>
  <path d="M1 1L31 41H261L291 1" stroke="#00FF7F" stroke-linecap="round" />
  <ZoomLevelBars :zoom-level="zoomLevel" />
</template>

<style scoped>

</style>
