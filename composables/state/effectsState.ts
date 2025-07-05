/**
 * @module effectsState
 * @description This module defines the reactive state and configuration for post-processing effects,
 * primarily the `OutlinePass`. It provides a centralized place to control which objects are outlined
 * and the appearance of the outline effect.
 */
import { Color } from 'three'
import { ref } from 'vue'

const HOVER_COLOR = new Color('#FFFFFF')
const SELECT_COLOR = new Color('#00FF00')

/**
 * A reactive array of strings, where each string is the `name` of a `THREE.Object3D`
 * that should be highlighted by the `OutlinePass`.
 * The `usePostProcessing` composable watches this array to update the effect.
 */
export const outlinedObjects = ref<string[]>([])
/**
 * A reactive reference to the current color of the outline effect.
 * Watched by `usePostProcessing` to update the `OutlinePass` color.
 */
export const outlineColor = ref(HOVER_COLOR)

/**
 * A static object containing the parameters for the `OutlinePass` effect.
 * These values control the visual appearance of the outline.
 */
export const outlineParams = {
  // * The strength of the outline edge
  edgeStrength: 5.0,
  // * The amount of glow for the outline
  edgeGlow: 0.7,
  // * The thickness of the outline
  edgeThickness: 2.0,
  // * The period of the pulsing effect for the outline (0 means no pulse)
  pulsePeriod: 0,
}

export { HOVER_COLOR, SELECT_COLOR }
