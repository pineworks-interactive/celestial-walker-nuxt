<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DrawerMenu from '@/components/scene-menu/DrawerMenu.vue'
import CornerNE from '@/components/scene-overlay/corners/CornerNE.vue'
import CornerNW from '@/components/scene-overlay/corners/CornerNW.vue'
import CornerSE from '@/components/scene-overlay/corners/CornerSE.vue'
import CornerSW from '@/components/scene-overlay/corners/CornerSW.vue'
import ZoomLevel from '@/components/scene-overlay/zoom-level/ZoomLevelField.vue'

// * ViewBox's Overlay
const overlayViewBoxWidth = 1920
const overlayViewBoxHeight = 1080
const overlayViewBox = computed(() => `0 0 ${overlayViewBoxWidth} ${overlayViewBoxHeight}`)

// * Reactive window's dimensions
const windowWidth = ref(1920)
const windowHeight = ref(1080)

// * Drawer menu state
const isMenuOpen = ref(false)
// drawer menu's functions
function closeMenu() {
  isMenuOpen.value = false
}
function openMenu() {
  isMenuOpen.value = true
}

// * Frame config
const overlayColor = '#00FF7F'
const mainFrameDesiredStrokeWidth = 1
const frameMargin = 10

// * Anchors data
const cornerAnchors = {
  nw: {
    originalWidth: 83,
    originalHeight: 293,
  },
  ne: {
    originalWidth: 43,
    originalHeight: 43,
  },
  sw: {
    originalWidth: 284,
    originalHeight: 43,
  },
  se: {
    originalWidth: 68,
    originalHeight: 68,
  },
}

// * Zoom level data
const zoomLevelGeometry = {
  originalWidth: 292,
  originalHeight: 42,
}

// * Scaling rules
const baseScale = computed(() => windowHeight.value / 1080)
const minScale = 0.5
const maxScale = 3
const finalScale = computed(() => {
  return Math.max(minScale, Math.min(maxScale, baseScale.value))
})

// * Aspect ratio correction
const scaleCorrection = computed(() => {
  const windowRatio = windowWidth.value / windowHeight.value
  const viewBoxRatio = overlayViewBoxWidth / overlayViewBoxHeight
  return viewBoxRatio / windowRatio
})

// * Calculate dynamic positions & sizes
const nwProps = computed(() => {
  const scale = finalScale.value
  const scaleX = scale * scaleCorrection.value
  const scaleY = scale
  return {
    scaleX,
    scaleY,
    x: frameMargin,
    y: frameMargin,
    width: cornerAnchors.nw.originalWidth * scaleX,
    height: cornerAnchors.nw.originalHeight * scaleY,
  }
})

const neProps = computed(() => {
  const scale = finalScale.value
  const scaleX = scale * scaleCorrection.value
  const scaleY = scale
  const width = cornerAnchors.ne.originalWidth * scaleX
  return {
    scaleX,
    scaleY,
    x: overlayViewBoxWidth - width - frameMargin,
    y: frameMargin,
    width,
    height: cornerAnchors.ne.originalHeight * scaleY,
  }
})

const swProps = computed(() => {
  const scale = finalScale.value
  const scaleX = scale * scaleCorrection.value
  const scaleY = scale
  const height = cornerAnchors.sw.originalHeight * scaleY
  return {
    scaleX,
    scaleY,
    x: frameMargin,
    y: overlayViewBoxHeight - height - frameMargin,
    width: cornerAnchors.sw.originalWidth * scaleX,
    height,
  }
})

const seProps = computed(() => {
  const scale = finalScale.value
  const scaleX = scale * scaleCorrection.value
  const scaleY = scale
  const width = cornerAnchors.se.originalWidth * scaleX
  const height = cornerAnchors.se.originalHeight * scaleY
  return {
    scaleX,
    scaleY,
    x: overlayViewBoxWidth - width - frameMargin,
    y: overlayViewBoxHeight - height - frameMargin,
    width,
    height,
  }
})

const zoomLevelProps = computed(() => {
  const scale = finalScale.value
  const scaleX = scale * scaleCorrection.value
  const scaleY = scale
  const width = zoomLevelGeometry.originalWidth * scaleX
  const height = zoomLevelGeometry.originalHeight * scaleY
  const x = neProps.value.x - width - (width / 2)
  return {
    scaleX,
    scaleY,
    x,
    y: frameMargin,
    width,
    height,
  }
})

// * Geometry of the menu button
const menuButtonGeometry = {
  originalY: 22,
  originalHeight: 250,
}

// * Drawer menu's properties
const drawerProps = computed(() => {
  const y = nwProps.value.y + menuButtonGeometry.originalY * nwProps.value.scaleY
  const height = menuButtonGeometry.originalHeight * nwProps.value.scaleY
  const x = nwProps.value.x + nwProps.value.width

  return { x, y, height }
})

onMounted(() => {
  // initial values
  windowHeight.value = window.innerHeight
  windowWidth.value = window.innerWidth

  // resize
  const handleResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  // cleanup
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<template>
  <div class="scene-overlay-container">
    <svg
      id="overlay-svg"
      :viewBox="overlayViewBox"
      preserveAspectRatio="none"
    >
      <defs />
      <g
        id="responsive-frame"
        :style="{
          fill: 'none',
          stroke: overlayColor,
          strokeWidth: mainFrameDesiredStrokeWidth,
          strokeLinecap: 'round',
        }"
      >
        <g
          :transform="`translate(${nwProps.x}, ${nwProps.y}) scale(${nwProps.scaleX}, ${nwProps.scaleY})`"
          style="pointer-events: auto; cursor: pointer"
          @click="openMenu"
        >
          <CornerNW />
        </g>
        <g
          :transform="`translate(${neProps.x}, ${neProps.y}) scale(${neProps.scaleX}, ${neProps.scaleY})`"
        >
          <CornerNE />
        </g>
        <g
          :transform="`translate(${swProps.x}, ${swProps.y}) scale(${swProps.scaleX}, ${swProps.scaleY})`"
        >
          <CornerSW />
        </g>
        <g
          :transform="`translate(${seProps.x}, ${seProps.y}) scale(${seProps.scaleX}, ${seProps.scaleY})`"
        >
          <CornerSE />
        </g>
        <g
          :transform="`translate(${zoomLevelProps.x}, ${zoomLevelProps.y}) scale(${zoomLevelProps.scaleX}, ${zoomLevelProps.scaleY})`"
        >
          <ZoomLevel />
        </g>

        <!-- connector lines -->
        <line
          :x1="nwProps.x + nwProps.width - 1"
          :y1="frameMargin + 2"
          :x2="zoomLevelProps.x + 1"
          :y2="frameMargin + 1.5"
        />
        <line
          :x1="zoomLevelProps.x + zoomLevelProps.width - 1"
          :y1="frameMargin + 1.5"
          :x2="neProps.x"
          :y2="frameMargin + 2"
        />
        <line
          :x1="neProps.x + neProps.width - 2"
          :y1="neProps.y + neProps.height"
          :x2="seProps.x + seProps.width - 2"
          :y2="seProps.y"
        />
        <line
          :x1="swProps.x + swProps.width - 2"
          :y1="swProps.y + swProps.height - 2"
          :x2="seProps.x"
          :y2="seProps.y + seProps.height - 2"
        />
        <line
          :x1="nwProps.x + 2"
          :y1="nwProps.y + nwProps.height - 0.5"
          :x2="swProps.x + 2"
          :y2="swProps.y"
        />
      </g>
      <DrawerMenu
        :is-open="isMenuOpen"
        :x="drawerProps.x"
        :y="drawerProps.y"
        :menu-height="drawerProps.height"
        :menu-color="overlayColor"
        @close="closeMenu"
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
