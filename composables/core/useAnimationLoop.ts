/**
 * @module useAnimationLoop
 * @description This module provides a simple and efficient animation loop manager for a 3JS scene
 * It leverages `requestAnimationFrame` for smooth rendering and integrates various managers
 * (simulation, interaction, camera) to create a cohesive and interactive experience
 */
import type { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import type { useThreeCore } from '@/composables/core/useThreeCore'
import type { useCameraManager } from '@/composables/features/useCameraManager'
import type { useInteractionManager } from '@/composables/features/useInteractionManager'
import type { useSimulationManager } from '@/composables/features/useSimulationManager'
import type { useZoomManager } from '@/composables/features/useZoomManager'
import { Clock } from 'three'

import { setCameraDistance } from '@/composables/state/cameraState'
import { timeConfig } from '@/configs/scaling.config'

type ThreeCore = ReturnType<typeof useThreeCore>
type CameraManager = ReturnType<typeof useCameraManager>
type SimulationManager = ReturnType<typeof useSimulationManager>
type InteractionManager = ReturnType<typeof useInteractionManager>
type ZoomManager = ReturnType<typeof useZoomManager>

// ~ --- Module-level state ---

/**
 * @private
 * @type {number}
 * Stores the ID of the current animation frame request
 * This is used to cancel the loop when it's no longer needed
 */
let animationFrameId: number
/**
 * @private
 * @type {number}
 * Tracks the total simulated time that has passed, adjusted by the simulation speed
 */
let simulatedTime = 0
/**
 * @private
 * @type {Clock}
 * A 3JS Clock instance to measure the time delta between frames
 */
const clock = new Clock()

/**
 * # Creates and manages the main animation loop for the scene
 *
 * @param {ThreeCore} threeCore - The core 3JS components (scene, camera, renderer, controls)
 * @param {EffectComposer} composer - The post-processing composer for rendering
 * @param {CameraManager} cameraManager - The manager for camera movements and behaviors
 * @param {SimulationManager} simulationManager - The manager for updating celestial body positions and rotations
 * @param {InteractionManager} interactionManager - The manager for handling user interactions like hover and click
 * @param {ZoomManager} zoomManager - The manager for tracking and updating the scene's zoom level
 * @returns {object} An object with `start` and `stop` methods to control the animation loop
 */
export function useAnimationLoop(
  threeCore: ThreeCore,
  composer: EffectComposer,
  cameraManager: CameraManager,
  simulationManager: SimulationManager,
  interactionManager: InteractionManager,
  zoomManager: ZoomManager,
) {
  /**
   * ~ Starts the animation loop
   */
  const start = () => {
    /**
     * @private
     * The main rendering function, called recursively with `requestAnimationFrame`
     */
    const animate = () => {
      // * Request the next frame, and store the ID so we can cancel it later
      animationFrameId = requestAnimationFrame(animate)

      const { camera, controls } = threeCore

      // * Get the time elapsed since the last frame
      const deltaTime = clock.getDelta()
      // * Update our simulated time, scaled by the simulation speed factor
      simulatedTime += deltaTime * timeConfig.simulationSpeed

      // * Update all simulation logic (planet rotations, orbital positions)
      simulationManager.update(simulatedTime, deltaTime)

      // * Check if the mouse is hovering over any interactive objects
      interactionManager.checkHoverIntersection()

      // * Update the camera's position if it's following a celestial body
      cameraManager.update()

      // * Update the orbit controls (e.g., for damping)
      controls.value?.update()

      // * Update the zoom level based on the camera's distance to its target
      if (controls.value) {
        const distance = camera.value.position.distanceTo(controls.value.target)
        setCameraDistance(distance)
        zoomManager.updateZoomLevelFromDistance(distance)
      }

      // * Render the scene through the post-processing composer
      composer.render()
    }
    // * Start the animation loop
    animate()
  }

  /**
   * ~ Stops the animation loop
   */
  const stop = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
  }

  return {
    start,
    stop,
  }
}
