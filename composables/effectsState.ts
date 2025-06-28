import type { Object3D } from 'three'
import { Color } from 'three'
import { ref } from 'vue'

/**
 * # Holds the reactive state for post-processing effects.
 */

// The meshes that should be outlined by the OutlinePass.
export const outlinedObjects = ref<Object3D[]>([])
export const outlineColor = ref<Color>(new Color('#ffffff')) // default to white

export const outlineParams = {
  edgeStrength: 5.0,
  edgeGlow: 0.7,
  edgeThickness: 2.0,
  pulsePeriod: 0,
}

export const HOVER_COLOR = new Color('#ffffff') // white
export const SELECT_COLOR = new Color('#00ff00') // green
