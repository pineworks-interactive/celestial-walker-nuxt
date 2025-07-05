<script setup lang="ts">
import { gsap } from 'gsap'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { isInfoWindowOpen, selectedBody } from '~/composables/state/interactionState'
import { colors as colorConfig } from '@/configs/colors.config'

const colors = ref(colorConfig)
const infoWindowRef = ref<HTMLDivElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const paths = ref<(SVGPathElement | null)[]>([])
const pathData = ref<string[]>(Array.from({ length: 8 }, () => ''))
const borderAnimationStarted = ref(false)

let animation: gsap.core.Timeline | null = null

function calculatePaths(width: number, height: number, radius: number) {
  if (width <= 0 || height <= 0)
    return

  const r = Number.isNaN(radius) ? 0 : Math.min(radius, width / 2, height / 2)
  if (r < 0)
    return

  const strokeWidth = 1
  const halfStroke = strokeWidth / 2

  pathData.value = [
    `M ${r},${halfStroke} H ${width - r}`,
    `M ${width - r},${halfStroke} A ${r - halfStroke},${r - halfStroke} 0 0 1 ${width - halfStroke},${r}`,
    `M ${width - halfStroke},${r} V ${height - r}`,
    `M ${width - halfStroke},${height - r} A ${r - halfStroke},${r - halfStroke} 0 0 1 ${width - r},${height - halfStroke}`,
    `M ${width - r},${height - halfStroke} H ${r}`,
    `M ${r},${height - halfStroke} A ${r - halfStroke},${r - halfStroke} 0 0 1 ${halfStroke},${height - r}`,
    `M ${halfStroke},${height - r} V ${r}`,
    `M ${halfStroke},${r} A ${r - halfStroke},${r - halfStroke} 0 0 1 ${r},${halfStroke}`,
  ]
}

watch(isInfoWindowOpen, (isOpen) => {
  if (animation)
    animation.kill()

  if (!isOpen) {
    // ? reset paths when closing
    const segments = paths.value.filter(p => p)
    if (segments.length > 0) {
      gsap.set(segments, { opacity: 0 })
    }
    borderAnimationStarted.value = false
  }
  else {
    // ? reset animation state when opening
    borderAnimationStarted.value = false
  }

  animation = gsap.timeline()

  animation
    .to(containerRef.value, {
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      duration: 0.5,
    }, 0)
    .to(infoWindowRef.value, {
      maxHeight: isOpen ? '80vh' : 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onUpdate() {
        // ? start border animation when window is 70% expanded
        if (isOpen && this.progress() > 0.7 && !borderAnimationStarted.value && infoWindowRef.value) {
          borderAnimationStarted.value = true

          nextTick(() => {
            const { width, height } = infoWindowRef.value!.getBoundingClientRect()
            const radius = Number.parseFloat(getComputedStyle(infoWindowRef.value!).borderRadius)
            calculatePaths(width, height, radius)

            // ? wait for paths to be updated in DOM
            nextTick(() => {
              const segments = paths.value.filter(p => p)
              if (segments.length === 8) {
                // ? initialize paths for animation
                gsap.set(segments, {
                  strokeDasharray: (i, el) => el.getTotalLength() || 0,
                  strokeDashoffset: (i, el) => el.getTotalLength() || 0,
                  opacity: 1,
                })

                const corners = [segments[1], segments[3], segments[5], segments[7]]
                const lines = [segments[0], segments[2], segments[4], segments[6]]

                // ? start border drawing animation
                gsap.timeline()
                  .to(corners, {
                    strokeDashoffset: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                    stagger: 0.07,
                  })
                  .to(lines, {
                    strokeDashoffset: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                    stagger: 0.07,
                  }, '-=0.2')
              }
            })
          })
        }
      },
    }, 0)
})

onMounted(() => {
  gsap.set(containerRef.value, { opacity: 0, pointerEvents: 'none' })
  gsap.set(infoWindowRef.value, { maxHeight: 0 })
})

function closeWindow(event?: MouseEvent) {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  isInfoWindowOpen.value = false
}
const bodyDescription = computed(() => selectedBody.value?.description || 'No celestial body selected.')
const bodyName = computed(() => selectedBody.value?.name || 'No celestial body selected.')
</script>

<template>
  <div
    ref="containerRef"
    class="info-window-container"
    @click.self="closeWindow"
  >
    <div
      ref="infoWindowRef"
      class="info-window"
      :style="{ '--border-color': colors.springGreen }"
    >
      <svg class="animated-border-svg">
        <path
          v-for="(d, i) in pathData"
          :key="i"
          :ref="el => { if (el) paths[i] = el as SVGPathElement }"
          :d="d"
          class="animated-border-path"
        />
      </svg>
      <div class="info-window-header">
        <h2>{{ bodyName }}</h2>
        <button class="close-button" @click="closeWindow">
          <Icon name="solar:close-circle-broken" />
        </button>
      </div>
      <div class="info-window-content">
        <p>{{ bodyDescription }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-window-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  opacity: 0;
}

.info-window {
  position: relative;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.7), rgba(30, 30, 30, 0.6));
  backdrop-filter: blur(8px);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  margin-top: 15vh;
  color: white;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.animated-border-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.animated-border-path {
  stroke: var(--border-color);
  stroke-width: 2px;
  fill: none;
  opacity: 0;
  filter: drop-shadow(0 0 4px var(--border-color));
}

.info-window-header,
.info-window-content {
  z-index: 1;
}

.info-window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), transparent);
}

.info-window-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.info-window-content {
  padding: 2rem;
  overflow-y: auto;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--border-color);
  font-size: 2.2rem;
  font-weight: 300;
  cursor: pointer;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
  padding: 0;
  margin: 0;
  position: relative;
}

.close-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--border-color);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease;
  filter: blur(8px);
  z-index: -1;
}

.close-button:hover {
  color: var(--border-color);
  transform: scale(1.05);
}

.close-button:hover::before {
  opacity: 0.3;
}

.info-window-content p {
  margin: 0;
  line-height: 1.7;
  font-size: 1.1rem;
}
</style>
