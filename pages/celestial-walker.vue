<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { useThreeSceneManager } from '@/composables/useThreeSceneManager'

const { scene, camera, renderer, isInitialized } = useThreeSceneManager({
  containerId: 'canvas',
  fov: 75,
  near: 0.1,
  far: 1000,
})
</script>

<template>
  <div>
    <h1 class="text-lg font-bold underline">
      Celestial Walker
    </h1>
    <h3 class="text-md italic mt-2">
      An interactive 3D experience that will take you up to our solar system.
    </h3>
  </div>
  <div class="mt-4">
    <Button to="/" label="Back Home" color="tertiary" icon="solar:alt-arrow-left-bold-duotone" />
  </div>
  <canvas id="canvas" class="w-full h-screen" />
</template>

<style scoped>
#canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
</style>
