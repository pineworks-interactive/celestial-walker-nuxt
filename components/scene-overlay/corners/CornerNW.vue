<script setup lang="ts">
import { colors } from '@/configs/colors.config'
</script>

<template>
  <g class="menu-button-container">
    <path
      d="M60 20L20 60V270M60 20V230L20 270M60 20L80 0M20 270L0 290"
      :stroke="colors.springGreen"
      stroke-linecap="round"
      class="button-bg"
    />
    <path
      d="M10 0H0V10"
      :stroke="colors.springGreen"
      stroke-opacity="0.5"
      stroke-width="3"
      stroke-linecap="square"
    />
    <text y="86" class="button-text">
      <tspan x="40" dy="1.2em">
        M
      </tspan>
      <tspan x="40" dy="1.2em">
        E
      </tspan>
      <tspan x="41" dy="1.2em">
        N
      </tspan>
      <tspan x="39" dy="1.2em">
        U
      </tspan>
    </text>
  </g>
</template>

<style scoped>
.button-bg {
  fill: transparent;
  transition: fill 0.2s ease;
}

.button-text {
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
  font-size: 22px;
  font-weight: 600;
  text-anchor: middle;
  transition: fill 0.1s ease;
  user-select: none; /* Prevents text selection on click */
}

.menu-button-container:hover .button-bg {
  fill: v-bind('colors.springGreen');
}

.menu-button-container:hover .button-text {
  fill: v-bind('colors.black');
  stroke: v-bind('colors.black');
}
</style>
