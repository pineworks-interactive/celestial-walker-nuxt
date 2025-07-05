/**
 * @module useTacticalView
 * @description This module provides a global way to toggle the camera's tactical view
 * It uses a simple registration pattern to decouple the UI components that trigger the
 * toggle from the `useCameraManager` that actually implements the logic
 */
import { isTacticalViewActive } from '~/composables/state/interactionState'

// ~ --- Module-level state ---

/**
 * @private
 * @type {(() => void) | null}
 * A reference to the camera manager's `toggleTacticalView` function
 * This is set by the `registerTacticalViewToggle` function
 */
let cameraManagerToggle: (() => void) | null = null

/**
 * ~ Registers the camera manager's toggle function, making it available to the global `toggleTacticalView` function
 * This should be called from `useSceneOrchestrator` once the camera manager is created
 *
 * @param {() => void} toggleFn - The `toggleTacticalView` function from the `useCameraManager` instance
 */
export function registerTacticalViewToggle(toggleFn: () => void) {
  cameraManagerToggle = toggleFn
}

/**
 * ~ A global function that can be called from anywhere in the application to toggle the camera's tactical view
 * It invokes the registered function from the camera manager
 */
export function toggleTacticalView() {
  if (cameraManagerToggle) {
    cameraManagerToggle()
  }
  else {
    // * This warning helps diagnose issues if the registration process fails
    console.warn('Camera manager toggle function not registered')
  }
}

/**
 * ~ A composable function that provides the tactical view's reactive state and the global toggle function
 * This is intended for use in UI components that need to display the tactical view state or trigger the toggle
 *
 * @returns {object} An object containing the `isTacticalViewActive` reactive state and the `toggleTacticalView` function
 */
export function useTacticalView() {
  return {
    isTacticalViewActive,
    toggleTacticalView,
  }
}
