import type { CelestialBodyState } from '@/types/solarSystem.types'
import { ref, shallowRef } from 'vue'

/**
 * # Holds the reactive state for scene interactions.
 *
 * @property {Ref<CelestialBodyState | null>} hoveredBody - The celestial body currently under the mouse cursor
 * @property {Ref<CelestialBodyState | null>} selectedBody - The celestial body that has been clicked onto
 * @property {Ref<boolean>} isCameraFollowing - True when the camera has finished its focus animation and is actively following the selected body
 */
export const hoveredBody = shallowRef<CelestialBodyState | null>(null)
export const selectedBody = shallowRef<CelestialBodyState | null>(null)
export const isCameraFollowing = ref(false)
