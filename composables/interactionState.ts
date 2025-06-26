import type { CelestialBodyState } from '@/types/solarSystem.types'
import { shallowRef } from 'vue'

/**
 * # Holds the reactive state for scene interactions.
 *
 * @property {Ref<CelestialBodyState | null>} hoveredBody - The celestial body currently under the mouse cursor
 * @property {Ref<CelestialBodyState | null>} selectedBody - The celestial body that has been clicked onto
 */
export const hoveredBody = shallowRef<CelestialBodyState | null>(null)
export const selectedBody = shallowRef<CelestialBodyState | null>(null)
