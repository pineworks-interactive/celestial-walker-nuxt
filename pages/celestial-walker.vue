<script setup lang="ts">
import InfosWindow from '@/components/info-window/InfosWindow.vue'
import SceneOverlay from '@/components/scene-overlay/SceneOverlaySvg.vue'
import { useSceneOrchestrator } from '@/composables/useSceneOrchestrator'
import { sceneConfig } from '@/configs/scene.config'

useSceneOrchestrator(sceneConfig)
</script>

<template>
  <canvas id="canvas" class="w-full h-screen" />
  <SceneOverlay />
  <InfosWindow />
</template>

<style scoped>
#canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
