<script setup lang="ts">
import { useThreeSceneManager } from '@/composables/useThreeSceneManager'
import { sceneConfig } from '@/configs/scene.config'

useThreeSceneManager(sceneConfig)
</script>

<template>
  <!-- <div>
    <h1 class="text-lg font-bold underline">
      Celestial Walker
    </h1>
    <h3 class="text-md italic mt-2">
      An interactive 3D experience that will take you up to our solar system.
    </h3>
  </div>
  <div class="mt-4">
    <Button to="/" label="Back Home" color="tertiary" icon="solar:alt-arrow-left-bold-duotone" />
  </div> -->
  <canvas id="canvas" class="w-full h-screen" />
</template>

<style scoped>
#canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* z-index: -1; */
}
</style>
