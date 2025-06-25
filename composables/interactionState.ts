import type { HoveredBodyState } from '@/types/scene.types'
import type { CelestialBody } from '@/types/solarSystem.types'
import { ref } from 'vue'

/**
 * # Holds the reactive state for scene interactions.
 *
 * @property {Ref<HoveredBodyState | null>} hoveredBody - The celestial body currently under the mouse cursor
 * @property {Ref<CelestialBody | null>} selectedBody - The celestial body that has been clicked onto
 */
export const hoveredBody = ref<HoveredBodyState | null>(null)
export const selectedBody = ref<CelestialBody | null>(null)
