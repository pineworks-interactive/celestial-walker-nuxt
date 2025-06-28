<script setup lang="ts">
import { gsap } from 'gsap'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { isTacticalViewActive } from '@/composables/interactionState'
import { colors } from '@/configs/colors.config'

interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'toggle', value: boolean): void
  (e: 'toggleTacticalView'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<Emits>()

// * Refs for GSAP animation
const normalIconContainer = ref<HTMLElement>()
const tacticalIconContainer = ref<HTMLElement>()
const iconWrapper = ref<HTMLElement>()

// *Animation state
const isAnimating = ref(false)

/**
 * ~ GSAP icons morphing animation
 */
function animateIconMorph(toTactical: boolean) {
  if (isAnimating.value)
    return

  // * Type guard
  if (!normalIconContainer.value || !tacticalIconContainer.value || !iconWrapper.value) {
    console.warn('Icon elements not available for animation')
    return
  }

  isAnimating.value = true

  const fromContainer = toTactical ? normalIconContainer.value : tacticalIconContainer.value
  const toContainer = toTactical ? tacticalIconContainer.value : normalIconContainer.value

  // * GSAP timeline matches camera animation duration (2 seconds)
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  // * Animate the transition
  tl.to(fromContainer, {
    scale: 0.8,
    opacity: 0,
    rotation: toTactical ? 180 : -180,
    duration: 1.0,
    ease: 'power2.in',
  })
    .to(toContainer, {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 1.0,
      ease: 'power2.out',
    }, 1.0) // ? start second animation halfway
    .to(iconWrapper.value, {
      scale: 1.1,
      duration: 0.3,
      ease: 'back.out(1.7)',
      yoyo: true,
      repeat: 1,
    }, 1.5) // ? bounce effect
}

/**
 * ~ Handle toggle functionality with GSAP
 */
function handleToggle(): void {
  const newTacticalState = !isTacticalViewActive.value

  // ? start morphing animation
  animateIconMorph(newTacticalState)

  // ? emit toggle events
  emit('toggleTacticalView')

  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('toggle', newValue)
}

/**
 * ~ Handle space key press to exit tactical view
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.code === 'Space' && isTacticalViewActive.value) {
    event.preventDefault()

    // ? start icon morphing animation
    animateIconMorph(false)

    emit('toggleTacticalView')
    emit('update:modelValue', false)
    emit('toggle', false)
  }
}

/**
 * ~ Initialize icon states
 */
function initializeIconStates(): void {
  if (!normalIconContainer.value || !tacticalIconContainer.value) {
    console.warn('Icon elements not ready for initialization')
    return
  }

  // ? set initial states based on current tactical view state
  gsap.set(normalIconContainer.value, {
    scale: isTacticalViewActive.value ? 0 : 1,
    opacity: isTacticalViewActive.value ? 0 : 1,
    rotation: 0,
  })

  gsap.set(tacticalIconContainer.value, {
    scale: isTacticalViewActive.value ? 1 : 0,
    opacity: isTacticalViewActive.value ? 1 : 0,
    rotation: 0,
  })
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)

  // ? initialize icon states after DOM is ready
  nextTick(() => {
    initializeIconStates()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)

  // ? kill any ongoing GSAP animations
  if (normalIconContainer.value)
    gsap.killTweensOf(normalIconContainer.value)
  if (tacticalIconContainer.value)
    gsap.killTweensOf(tacticalIconContainer.value)
  if (iconWrapper.value)
    gsap.killTweensOf(iconWrapper.value)
})
</script>

<template>
  <g>
    <!-- * Corner decorative lines -->
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

    <!-- ~ Interactive triangle button -->
    <g
      class="triangle-button"
      @click="handleToggle"
    >
      <!-- * triangle with hover effects -->
      <path
        d="M34.3282 0L-0.1544 34.4189L-0.0728 0L34.3282 0Z"
        :fill="colors.springGreen"
        :stroke="colors.springGreen"
        stroke-width="0.5"
        class="triangle-shape"
        :class="{ 'triangle-active': modelValue || isTacticalViewActive }"
      />

      <!-- * Icon container with morphing icons -->
      <foreignObject
        x="0"
        y="0"
        width="25"
        height="25"
        class="triangle-icon-container"
      >
        <div
          ref="iconWrapper"
          class="icon-wrapper"
        >
          <!-- ? Normal state icon -->
          <div
            ref="normalIconContainer"
            class="icon-container normal-icon-container"
          >
            <Icon
              name="solar:black-hole-bold"
              class="triangle-icon triangle-icon-normal"
            />
          </div>

          <!-- ? Tactical state icon -->
          <div
            ref="tacticalIconContainer"
            class="icon-container tactical-icon-container"
          >
            <Icon
              name="solar:asteroid-linear"
              class="triangle-icon triangle-icon-tactical"
            />
          </div>
        </div>
      </foreignObject>
    </g>
  </g>
</template>

<style scoped>
.triangle-button {
  cursor: pointer;
}

.triangle-shape {
  fill-opacity: 0.8;
  stroke-opacity: 0.8;
  transition: all 0.2s ease-out;
}

/* Active state */
.triangle-shape.triangle-active {
  fill-opacity: 1;
  stroke-opacity: 1;
}

/* Simple hover effect */
.triangle-button:hover .triangle-shape {
  fill-opacity: 0.95;
  stroke-opacity: 0.95;
  filter: drop-shadow(0 0 6px v-bind('colors.springGreen'));
}

/* Active hover override */
.triangle-button:hover .triangle-shape.triangle-active {
  filter: drop-shadow(0 0 8px v-bind('colors.springGreen'));
}

/* Icon container styles */
.triangle-icon-container {
  pointer-events: none;
}

/* Icon wrapper */
.icon-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  padding-top: 1px;
  padding-left: 1px;
}

/* Icon containers (GSAP) */
.icon-container {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Initial hiding tactical icon container */
.tactical-icon-container {
  opacity: 0;
  transform: scale(0);
}

/* Icon styles */
.triangle-icon {
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* Normal icon (galaxy) */
.triangle-icon-normal {
  color: v-bind('colors.black');
}

/* Tactical icon (planet) */
.triangle-icon-tactical {
  color: v-bind('colors.black');
}

/* Hover effect on icon */
.triangle-button:hover .triangle-icon {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.7));
}
</style>
