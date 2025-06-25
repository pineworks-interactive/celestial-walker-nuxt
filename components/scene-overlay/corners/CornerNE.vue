<script setup lang="ts">
import { colors } from '@/configs/colors.config'
</script>

<template>
  <g>
    <path
      d="M0 0L40 40"
      :stroke="colors.springGreen"
      stroke-linecap="round"
    />
    <path
      d="M40 10V0H30"
      :stroke="colors.springGreen"
      stroke-opacity="0.5"
      stroke-width="3"
      stroke-linecap="square"
    />
  </g>
</template>

<style scoped>

</style>
