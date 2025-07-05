/**
 * @module cameraState
 * @description This module provides a simple, global, and reactive state for the camera's distance from its target
 */
import { readonly, ref } from 'vue'

/**
 * @private
 * @type {ref<number>}
 * A reactive reference holding the current distance of the camera from its target
 */
const _cameraDistance = ref(0)

/**
 * A readonly reactive reference to the camera's distance
 * Exposing it as readonly prevents components from directly modifying the state,
 * enforcing the use of the `setCameraDistance` function
 */
export const cameraDistance = readonly(_cameraDistance)

/**
 * Sets the global camera distance state
 *
 * @param {number} distance - The new distance value
 */
export function setCameraDistance(distance: number) {
  _cameraDistance.value = distance
}
