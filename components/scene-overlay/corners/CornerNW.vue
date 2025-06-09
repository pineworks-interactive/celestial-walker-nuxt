<script setup lang="ts">

</script>

<template>
  <g class="menu-button-container">
    <path
      d="M62 22L22 62V272M62 22V232L22 272M62 22L82 2M22 272L2 292"
      stroke="#00FF7F"
      stroke-linecap="round"
      class="button-bg"
    />
    <path
      d="M12 2H2V12"
      stroke="#00FF7F"
      stroke-opacity="0.5"
      stroke-width="3"
      stroke-linecap="square"
    />
    <text y="88" class="button-text">
      <tspan x="42" dy="1.2em">
        M
      </tspan>
      <tspan x="42" dy="1.2em">
        E
      </tspan>
      <tspan x="43" dy="1.2em">
        N
      </tspan>
      <tspan x="41" dy="1.2em">
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
  fill: #00ff7f;
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
  fill: #00ff7f;
}

.menu-button-container:hover .button-text {
  fill: #000000;
  stroke: #000000;
}
</style>
