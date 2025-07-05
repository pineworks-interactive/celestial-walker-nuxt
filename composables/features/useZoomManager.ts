/**
 * @module useZoomManager
 * @description This module provides a centralized way to manage and track the "zoom level" of the scene.
 * The zoom level is an abstract concept (from 0 to 10) that is derived from the camera's actual
 * distance to its target. This allows different parts of the UI to react to how zoomed in or out
 * the user is, without needing to know the specific camera distance.
 */
import { readonly, ref } from 'vue'
import { zoomThresholds } from '@/configs/zoom.config'

/**
 * @private
 * @type {ref<number>}
 * A reactive reference to the current zoom level, from 0 (zoomed out) to 10 (zoomed in).
 */
const zoomLevel = ref(0)

/**
 * # A composable function for managing and providing access to the scene's zoom level
 *
 * @returns {object} An object containing the reactive `zoomLevel` and functions to update it
 */
export function useZoomManager() {
  /**
   * ~ Sets the zoom level directly, ensuring it stays within the 0-10 bounds
   *
   * @param {number} level - The new zoom level to set
   */
  const setZoomLevel = (level: number) => {
    zoomLevel.value = Math.max(0, Math.min(10, level))
  }

  /**
   * ~ Calculates and sets the zoom level based on the camera's distance from its target
   * It compares the distance to a predefined array of thresholds
   *
   * @param {number} distance - The distance from the camera to its target in 3D units
   */
  const updateZoomLevelFromDistance = (distance: number) => {
    // * Find the index of the first threshold that is greater than the current distance
    const thresholdIndex = zoomThresholds.findIndex(threshold => distance < threshold)
    // * If no threshold is found (i.e., we are further away than all thresholds), the level is 0
    // * Otherwise, the level is calculated based on the index
    const newZoomLevel = thresholdIndex === -1 ? 0 : zoomThresholds.length - thresholdIndex
    setZoomLevel(newZoomLevel)
  }

  return {
    /**
     * ~ The current zoom level (0 = fully zoomed out, 10 = fully zoomed in)
     * Exposed as a `readonly` reference to prevent direct modification from outside the composable
     */
    zoomLevel: readonly(zoomLevel),
    setZoomLevel,
    updateZoomLevelFromDistance,
  }
}
