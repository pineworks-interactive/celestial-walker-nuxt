<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CSSProperties } from 'vue'

interface Props {
  isOpen: boolean
  x?: number
  y?: number
  menuHeight?: number
  targetWidth?: number
  menuColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  x: 0,
  y: 0,
  menuHeight: 1080,
  targetWidth: 800,
  menuColor: '#00ff7f',
})

const emit = defineEmits(['close'])

function closeMenu() {
  emit('close')
}

const finalWidth = computed(() => (props.isOpen ? props.targetWidth : 0))

const drawerGroup = ref<SVGGElement | null>(null)
const scaleX = ref(1)
const scaleY = ref(1)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!drawerGroup.value) return

  const svg = drawerGroup.value.ownerSVGElement
  if (!svg) return

  const updateScale = () => {
    if (svg.viewBox.baseVal.width > 0) {
      scaleX.value = svg.clientWidth / svg.viewBox.baseVal.width
    }
    if (svg.viewBox.baseVal.height > 0) {
      scaleY.value = svg.clientHeight / svg.viewBox.baseVal.height
    }
  }

  resizeObserver = new ResizeObserver(updateScale)
  resizeObserver.observe(svg)
  updateScale()
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

const contentStyle = computed((): CSSProperties => {
  if (scaleX.value === 0 || scaleY.value === 0 || !props.isOpen) return {}

  const scaledWidth = props.targetWidth * scaleX.value
  const scaledHeight = props.menuHeight * scaleY.value

  return {
    transform: `scale(${1 / scaleX.value}, ${1 / scaleY.value})`,
    transformOrigin: 'top left',
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    overflowY: 'auto',
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
  <defs>
      <linearGradient id="gradMenu" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="props.menuColor" stop-opacity="0.15" />
        <stop offset="100%" :stop-color="props.menuColor" stop-opacity="0.05" />
      </linearGradient>
    </defs>

    <!-- * Drawer UI -->
    <rect
      :width="finalWidth"
      :height="props.menuHeight"
      fill="url(#gradMenu)"
      :stroke="props.menuColor"
      stroke-width="2"
      style="transition: width 0.15s linear"
    />

    <!-- * HTML Content -->
    <foreignObject
      :width="finalWidth"
      :height="props.menuHeight"
      style="transition: width 0.15s linear"
    >
      <div class="drawer-content-wrapper" :style="contentStyle">
        <div class="drawer-content">
          <h2>Menu</h2>
          <p class="text-sm md:text-base">This is a menu, with responsive text.</p>
          <ul class="mt-4 flex list-none flex-wrap gap-4 p-0">
            <li
              class="cursor-pointer rounded border border-white/20 bg-white/5 p-2 transition-colors hover:border-current hover:bg-white/10"
            >
              Link 1
            </li>
            <li
              class="cursor-pointer rounded border border-white/20 bg-white/5 p-2 transition-colors hover:border-current hover:bg-white/10"
            >
              Link 2
            </li>
            <li
              class="cursor-pointer rounded border border-white/20 bg-white/5 p-2 transition-colors hover:border-current hover:bg-white/10"
            >
              Link 3
            </li>
            <li
              class="cursor-pointer rounded border border-white/20 bg-white/5 p-2 transition-colors hover:border-current hover:bg-white/10"
            >
              A Longer Link Item
            </li>
            <li
              class="cursor-pointer rounded border border-white/20 bg-white/5 p-2 transition-colors hover:border-current hover:bg-white/10"
            >
              Link 5
            </li>
          </ul>
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
  color: #ffffff;
  box-sizing: border-box;
}

.drawer-content {
  padding: 25px;
  opacity: 0;
  transition: opacity 0.2s linear;
}

.drawer-content h2 {
  margin-top: 0;
  color: v-bind('props.menuColor');
  border-bottom: 1px solid v-bind('props.menuColor');
  padding-bottom: 10px;
  letter-spacing: 1px;
}

.drawer-content ul {
  list-style: none;
  padding: 0;
}

.drawer-content li {
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s;
}
.drawer-content li:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: v-bind('props.menuColor');
}

.drawer-open .drawer-content {
  opacity: 1;
  transition-delay: 0.1s;
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
}

.close-button:hover,
.close-button:focus {
  background-color: v-bind('props.menuColor');
  color: #000000;
}
</style>
