import type { CelestialBodyState } from '@/types/solarSystem.types'
import { ref, shallowRef } from 'vue'

/**
 * # Holds the reactive state for scene interactions.
 *
 * @property {Ref<CelestialBodyState | null>} hoveredBody - The celestial body currently under the mouse cursor
 * @property {Ref<CelestialBodyState | null>} selectedBody - The celestial body that has been clicked onto
 * @property {Ref<boolean>} isCameraFollowing - True when the camera has finished its focus animation and is actively following the selected body
 * @property {Ref<boolean>} isInfoWindowOpen - True when the celestial body information window is open
 * @property {Ref<boolean>} isTacticalViewActive - True when the camera is in tactical/top-down view mode
 */
export const hoveredBody = shallowRef<CelestialBodyState | null>(null)
export const selectedBody = shallowRef<CelestialBodyState | null>(null)
export const isCameraFollowing = ref(false)
export const isInfoWindowOpen = ref(false)
export const isTacticalViewActive = ref(false)
