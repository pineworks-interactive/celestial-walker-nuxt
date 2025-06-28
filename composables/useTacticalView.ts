import { isTacticalViewActive } from '@/composables/interactionState'

// * Global reference to the camera manager's toggle function
let cameraManagerToggle: (() => void) | null = null

/**
 * # Register the camera manager's toggle function
 * (called from useThreeSceneManager when camera manager is created)
 */
export function registerTacticalViewToggle(toggleFn: () => void) {
  cameraManagerToggle = toggleFn
}

/**
 * # Global function to toggle tactical view
 * (can be called from anywhere in the app)
 */
export function toggleTacticalView() {
  if (cameraManagerToggle) {
    cameraManagerToggle()
  }
  else {
    console.warn('Camera manager toggle function not registered')
  }
}

/**
 * # Composable for tactical view functionality
 */
export function useTacticalView() {
  return {
    isTacticalViewActive,
    toggleTacticalView,
  }
}
