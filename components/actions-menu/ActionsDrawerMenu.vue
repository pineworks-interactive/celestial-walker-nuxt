<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import MenuAccordionBodies from '@/components/actions-menu/MenuAccordionBodies.vue'
import MenuAccordionOrbits from '@/components/actions-menu/MenuAccordionOrbits.vue'
import { useDebugActions } from '@/composables/useVisualisation'
import { globalAxes, globalGrids, globalWireframe } from '@/composables/visualisationState'
import { colors } from '@/configs/colors.config'

interface Props {
  isOpen: boolean
  x?: number
  y?: number
  height?: number
  targetWidth?: number
  menuColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  x: 0,
  y: 0,
  height: 1080,
  targetWidth: 500,
  menuColor: colors.springGreen,
})

const emit = defineEmits(['close'])

const {
  toggleGlobalWireframe,
  toggleGlobalAxes,
  toggleGlobalGrids,
} = useDebugActions()

function closeMenu() {
  emit('close')
}

const finalWidth = computed(() => (props.isOpen ? props.targetWidth : 0))

const drawerGroup = ref<SVGGElement | null>(null)
const scaleX = ref(1)
const scaleY = ref(1)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!drawerGroup.value)
    return

  const svg = drawerGroup.value.ownerSVGElement
  if (!svg)
    return

  const updateScale = () => {
    if (svg.viewBox.baseVal.width > 0)
      scaleX.value = svg.clientWidth / svg.viewBox.baseVal.width

    if (svg.viewBox.baseVal.height > 0)
      scaleY.value = svg.clientHeight / svg.viewBox.baseVal.height
  }

  resizeObserver = new ResizeObserver(updateScale)
  resizeObserver.observe(svg)
  updateScale()
})

onUnmounted(() => {
  if (resizeObserver)
    resizeObserver.disconnect()
})

const contentStyle = computed((): CSSProperties => {
  if (scaleX.value === 0 || scaleY.value === 0 || !props.isOpen)
    return {}

  const scaledWidth = props.targetWidth * scaleX.value
  const scaledHeight = props.height * scaleY.value

  return {
    transform: `scale(${1 / scaleX.value}, ${1 / scaleY.value})`,
    transformOrigin: 'top left',
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    overflowX: 'hidden',
  }
})
</script>

<template>
  <g
    ref="drawerGroup"
    :transform="`translate(${props.x}, ${props.y})`"
    :style="{ pointerEvents: props.isOpen ? 'auto' : 'none' }"
    :class="{ 'drawer-open': props.isOpen }"
  >
    <!-- * Drawer UI -->
    <rect
      :width="finalWidth"
      :height="props.height"
      fill="transparent"
      :stroke="props.menuColor"
      stroke-width="2"
      style="transition: width 0.15s linear"
    />

    <!-- ~ HTML Content -->
    <foreignObject
      :width="finalWidth"
      :height="props.height"
      style="transition: width 0.15s linear"
    >
      <div class="drawer-content-wrapper" :style="contentStyle">
        <div class="drawer-content">
          <div class="scrollable-content">
            <h2>User Interface</h2>

            <!-- * Global Toggles -->
            <div class="dev-tools-section">
              <h3 class="dev-tools-title">
                Global Toggles
              </h3>
              <div class="flex flex-col gap-2">
                <button class="debug-button" @click="toggleGlobalWireframe">
                  <span>Toggle All Wireframe</span>
                  <span :class="{ 'text-green-400': globalWireframe }">{{ globalWireframe ? 'ON' : 'OFF' }}</span>
                </button>
                <button class="debug-button" @click="toggleGlobalAxes">
                  <span>Toggle All Axes</span>
                  <span :class="{ 'text-green-400': globalAxes }">{{ globalAxes ? 'ON' : 'OFF' }}</span>
                </button>
                <button class="debug-button" @click="toggleGlobalGrids">
                  <span>Toggle All Grids</span>
                  <span :class="{ 'text-green-400': globalGrids }">{{ globalGrids ? 'ON' : 'OFF' }}</span>
                </button>
              </div>
            </div>

            <hr class="separator">

            <!-- * Celestial Bodies Toggles -->
            <div class="dev-tools-section">
              <h3 class="dev-tools-title">
                Celestial Bodies
              </h3>
              <MenuAccordionBodies />
            </div>

            <hr class="separator">

            <!-- * Orbits Toggles -->
            <div class="dev-tools-section">
              <h3 class="dev-tools-title">
                Celestial Orbits
              </h3>
              <MenuAccordionOrbits />
            </div>
          </div>
          <button class="close-button" aria-label="Close menu" @click="closeMenu">
            Close
          </button>
        </div>
      </div>
    </foreignObject>
  </g>
</template>

<style scoped>
.drawer-content-wrapper {
  color: v-bind('colors.white');
  box-sizing: border-box;
  height: 100%;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.7), rgba(30, 30, 30, 0.6));
  backdrop-filter: blur(4px);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.drawer-content {
  padding: 25px;
  opacity: 0;
  transition: opacity 0.2s linear;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.drawer-open .drawer-content {
  opacity: 1;
  transition-delay: 0.1s;
}

.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 15px;
  margin-right: -15px;
}

.drawer-content h2 {
  margin-top: 0;
  color: v-bind('props.menuColor');
  border-bottom: 1px solid v-bind('props.menuColor');
  padding-bottom: 10px;
  letter-spacing: 1px;
}

.dev-tools-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.dev-tools-title {
  margin-bottom: 15px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 0.9em;
  color: v-bind('props.menuColor');
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.separator {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 30px 0;
}

.debug-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px 18px;
  cursor: pointer;
  border-radius: 4px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.debug-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.debug-button span:last-child {
  font-weight: bold;
  transition: color 0.2s;
}

.close-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid v-bind('props.menuColor');
  color: v-bind('props.menuColor');
  padding: 10px 18px;
  cursor: pointer;
  margin-top: 30px;
  border-radius: 4px;
  font-weight: bold;
  transition:
    background-color 0.2s,
    color 0.2s;
  flex-shrink: 0;
}

.close-button:hover,
.close-button:focus {
  background-color: v-bind('props.menuColor');
  color: #000000;
}
</style>
