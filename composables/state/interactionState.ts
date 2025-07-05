/**
 * @module interactionState
 * @description This module defines the global reactive state related to user interactions with the scene
 * It serves as a single source of truth for which object is currently hovered or selected, and for the
 * state of various modes like camera following or tactical view
 */
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { ref, shallowRef } from 'vue'

/**
 * The celestial body currently under the mouse cursor
 * Using `shallowRef` is a performance optimization, as we only care about the top-level
 * object reference changing, not the deep properties within the `CelestialBodyState`
 * @type {Ref<CelestialBodyState | null>}
 */
export const hoveredBody = shallowRef<CelestialBodyState | null>(null)

/**
 * The celestial body that has been clicked and is currently selected
 * `shallowRef` is used for performance reasons.
 * @type {Ref<CelestialBodyState | null>}
 */
export const selectedBody = shallowRef<CelestialBodyState | null>(null)

/**
 * A boolean flag indicating whether the camera has finished its focus animation
 * and is now actively following the `selectedBody`
 * @type {Ref<boolean>}
 */
export const isCameraFollowing = ref(false)

/**
 * A boolean flag indicating whether the informational window for a celestial body is currently open
 * @type {Ref<boolean>}
 */
export const isInfoWindowOpen = ref(false)

/**
 * A boolean flag indicating whether the camera is in the top-down tactical view mode
 * @type {Ref<boolean>}
 */
export const isTacticalViewActive = ref(false)
