<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold underline">
      Welcome to my space
    </h1>
    <h3 class="text-lg mt-4">
      I'm a software engineer and artist. Name's <span class="text-secondary font-bold">T3hx</span>.
    </h3>
    <p class="text-md italic mt-4">
      Click the links <span class="font-bold text-tertiary-400">below</span> to explore my work.
    </p>

    <div class="mt-8 flex gap-2">
      <Button to="/celestial-walker" label="Celestial Walker" size="lg" icon="solar:asteroid-linear" trailing />
      <Button to="/shopping-list" label="Shopping List" size="lg" icon="solar:bag-5-bold" trailing />
      <Button to="/gallery" label="3D Gallery" size="lg" icon="solar:gallery-minimalistic-linear" trailing />
    </div>
  </div>
</template>

<style scoped>

</style>
