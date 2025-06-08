<script setup lang="ts">
import { computed } from 'vue'

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
</script>

<template>
  <g
    :transform="`translate(${props.x}, ${props.y})`"
    :style="{ pointerEvents: props.isOpen ? 'auto' : 'none' }"
    :class="{ 'drawer-open': props.isOpen }"
  >
    <defs>
      <linearGradient id="gradMenu" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="props.menuColor" stop-opacity="0.15" />
        <stop offset="100%" :stop-color="props.menuColor" stop-opacity="0.05" />
      </linearGradient>
      <clipPath id="clipMenu">
        <rect
          :width="finalWidth"
          :height="props.menuHeight"
          style="transition: width 0.15s linear"
        />
      </clipPath>
    </defs>

    <g clip-path="url(#clipMenu)">
      <!-- Background and Border -->
      <rect
        :width="props.targetWidth"
        :height="props.menuHeight"
        fill="url(#gradMenu)"
        :stroke="props.menuColor"
        stroke-width="2"
      />

      <!-- * HTML Content -->
      <foreignObject :width="props.targetWidth" :height="props.menuHeight">
        <div class="drawer-content-wrapper">
          <div class="drawer-content">
            <h2>Menu</h2>
            <p>This is a menu</p>
            <ul>
              <li>Link 1</li>
              <li>Link 2</li>
              <li>Link 3</li>
            </ul>
            <button class="close-button" aria-label="Close menu" @click="closeMenu">
              Close
            </button>
          </div>
        </div>
      </foreignObject>
    </g>
  </g>
</template>

<style scoped>
.drawer-content-wrapper {
  width: 100%;
  height: 100%;
  color: #ffffff;
  box-sizing: border-box;
}

.drawer-content {
  padding: 25px;
  opacity: 0;
  transition: opacity 0.2s linear;
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

/* Basic styling for placeholder menu items */
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
</style>
