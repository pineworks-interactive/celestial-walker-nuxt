<script setup lang="ts">
import { computed, ref } from 'vue'
import SvgButton from './SvgButton.vue'

// overlay viewBox
const overlayViewBoxWidth = 1920
const overlayViewBoxHeight = 1080
const overlayViewBox = computed(() => `0 0 ${overlayViewBoxWidth} ${overlayViewBoxHeight}`)

// * Button configuration
// button's height relative to the overlay's height
const buttonHeightRatio = 0.39
const calculatedButtonHeight = overlayViewBoxHeight * buttonHeightRatio

// button's intrinsic aspectRatio
const buttonIntrinsicAspectRatio = 10.799147 / 111.40509
const calculatedButtonWidth = calculatedButtonHeight * buttonIntrinsicAspectRatio

// button's position
const buttonX = overlayViewBoxWidth * 0.025
const buttonY = overlayViewBoxHeight * 0.073

// button's function
function handleButtonClick() {
  console.warn('overlay button clicked')
}

// main frame path from original svg
const mainFramePathD = 'M 42.431801,0.37273126 H 296.33643 L 317.50066,15.189398 h 116.41727 l 21.1655,-14.81666674 h 52.76351 V 264.58442 c -6.81449,7.11662 -13.91757,13.93748 -21.00725,20.77608 H 21.282467 C 14.245772,278.58437 7.2289652,271.64428 0.37113313,264.612 V 142.8747 L 21.125546,121.61285 21.537799,21.300596 C 28.474113,14.165721 35.077877,7.6677509 42.431801,0.37273126 Z'
// const mainFrameTransform = 'matrix(0.99666563,0,0,0.99473473,0.13058939,0.12874667)' // Temporarily remove to simplify
const overlayColor = '#00FF7F'

const mainFrameDesiredStrokeWidth = 1
const decorationDesiredStrokeWidth = 0.5

// Recalculate scale and translation for main frame path
const pathOriginalWidth = 507.8355
const pathOriginalHeight = 285.35

// Target a smaller geometric width for more buffer
const targetGeometricWidth = 1910
const mainFrameGroupScale = targetGeometricWidth / pathOriginalWidth

const scaledGeometricHeight = pathOriginalHeight * mainFrameGroupScale
const mainFrameGroupTranslateX = (overlayViewBoxWidth - targetGeometricWidth) / 2
const mainFrameGroupTranslateY = (overlayViewBoxHeight - scaledGeometricHeight) / 2
</script>

<template>
  <div class="scene-overlay-container">
    <svg
      id="overlay-svg"
      :viewBox="overlayViewBox"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs />
      <g
        id="main-frame"
        :transform="`translate(${mainFrameGroupTranslateX}, ${mainFrameGroupTranslateY}) scale(${mainFrameGroupScale})`"
      >
        <path
          id="main-frame-path"
          :style="{
            fill: 'none',
            stroke: overlayColor,
            strokeWidth: mainFrameDesiredStrokeWidth,
            strokeLinecap: 'round',
            strokeDasharray: 'none',
            vectorEffect: 'non-scaling-stroke',
          }"
          :d="mainFramePathD"
        />
        <!-- :transform="mainFrameTransform" // Temporarily removed -->
        <path
          id="main-frame-decoration"
          :style="{
            fill: overlayColor,
            stroke: overlayColor,
            strokeWidth: decorationDesiredStrokeWidth,
            strokeLinecap: 'round',
            vectorEffect: 'non-scaling-stroke',
          }"
          d="m 484.18466,5.2794785 h 18.46158 V 23.741053 l -8.99836,-9.197583 z"
        />
      </g>
      <SvgButton
        button-id="overlay-menu-button"
        :x="buttonX"
        :y="buttonY"
        :width="calculatedButtonWidth"
        :height="calculatedButtonHeight"
        :button-color="overlayColor"
        text-color="#000000"
        text="menu"
        @click="handleButtonClick"
      />
    </svg>
  </div>
</template>

<style scoped>
.scene-overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
}

.scene-overlay-container svg {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
