<script setup>
import { colors } from '@/configs/colors.config'
</script>

<template>
  <g>
    <path
      d="M48 8L8 48"
      :stroke="colors.springGreen"
      stroke-linecap="round"
    />
    <path
      d="M38 48H48V38"
      :stroke="colors.springGreen"
      stroke-opacity="0.5"
      stroke-width="3"
      stroke-linecap="square"
    />
    <path
      d="M34.3282 0L-0.1544 34.4189L-0.0728 0L34.3282 0Z"
      :fill="colors.springGreen"
      :stroke="colors.springGreen"
      stroke-width="0.5"
    />
  </g>
</template>

<style scoped>

</style>
