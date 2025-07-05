/**
 * @module useCameraManager
 * @description This module provides comprehensive management of the main `PerspectiveCamera`
 * It handles complex camera movements such as focusing on celestial bodies, entering and exiting a tactical
 * top-down view, and smoothly following a selected object through the scene. It uses GSAP for robust and
 * smooth animations.
 */
import type { PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { gsap } from 'gsap'
import { MathUtils, Vector3 } from 'three'
import { setCameraDistance } from '@/composables/state/cameraState'
import { outlinedObjects } from '@/composables/state/effectsState'
import { isCameraFollowing, isTacticalViewActive, selectedBody } from '@/composables/state/interactionState'
import { cameraInitialPosition } from '@/configs/scene.config'

// ~ --- Constants ---
// * A multiplier to calculate the ideal camera distance from a target, ensuring the object doesn't fill the entire screen
const FOCAL_LENGTH_MULTIPLIER = 1.5
// * The fixed height (Y-coordinate) for the tactical camera view
const TACTICAL_VIEW_HEIGHT = 3950

// ~ --- Module-level state ---
// * Stores the active GSAP animation for focusing, allowing it to be interrupted
let focusAnimation: gsap.core.Tween | null = null
// * Stores the active GSAP animation for tactical view transitions, allowing it to be interrupted
let tacticalAnimation: gsap.core.Tween | null = null

/**
 * # Manages all camera movements and state transitions
 *
 * @param {PerspectiveCamera} camera - The main 3JS PerspectiveCamera instance
 * @param {OrbitControls} controls - The OrbitControls instance, which needs to be updated along with the camera
 * @returns {object} An object containing methods to control the camera (`focusOnBody`, `resetCamera`, `toggleTacticalView`, etc.)
 *                   and reactive state properties (`isFollowing`, `isTacticalView`)
 */
export function useCameraManager(camera: PerspectiveCamera, controls: OrbitControls) {
  // * Stores the world position of the followed object from the previous frame, used to calculate movement delta
  const lastTargetPosition = new Vector3()

  // * Stores the camera's state (position, target) before entering tactical view, so it can be restored upon exit
  const preTacticalCameraState = {
    position: new Vector3(),
    target: new Vector3(),
    wasFollowing: false,
  }

  // * Set the initial camera distance state
  setCameraDistance(camera.position.distanceTo(controls.target))

  /**
   * ~ Smoothly animates the camera to focus on a specific celestial body
   *
   * @param {CelestialBodyState} body - The state object of the celestial body to focus on
   */
  const focusOnBody = (body: CelestialBodyState) => {
    const { mesh } = body
    if (!mesh)
      return

    // * Interrupt any ongoing animations to prevent conflicts
    if (focusAnimation)
      focusAnimation.kill()
    if (tacticalAnimation)
      tacticalAnimation.kill()

    // * Reset state flags
    isCameraFollowing.value = false
    isTacticalViewActive.value = false

    mesh.geometry.computeBoundingSphere()
    const sphere = mesh.geometry.boundingSphere
    if (!sphere) {
      console.error(`Could not compute bounding sphere for ${body.name}`)
      return
    }

    // * Store the starting positions for smooth interpolation
    const startCamPos = camera.position.clone()
    const startTargetPos = controls.target.clone()

    // * Create a proxy object for GSAP to animate its 'progress' property from 0 to 1
    const proxy = { progress: 0 }

    focusAnimation = gsap.to(proxy, {
      progress: 1,
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate() {
        // * Calculate the target positions for the end of the animation
        const endTargetPos = new Vector3()
        mesh.getWorldPosition(endTargetPos)

        // * Calculate the ideal camera distance to fit the object in the view
        const fovInRadians = MathUtils.degToRad(camera.fov)
        const distanceToFit = sphere.radius / Math.tan(fovInRadians / 2)
        const finalDistance = distanceToFit * FOCAL_LENGTH_MULTIPLIER

        const endCamPos = new Vector3(
          endTargetPos.x,
          endTargetPos.y + finalDistance / 2,
          endTargetPos.z + finalDistance,
        )

        // * Use the 'progress' value to interpolate between start and end positions
        camera.position.copy(startCamPos).lerp(endCamPos, proxy.progress)
        controls.target.copy(startTargetPos).lerp(endTargetPos, proxy.progress)

        setCameraDistance(camera.position.distanceTo(controls.target))
      },
      onComplete() {
        // * Once the animation is complete, enable following mode
        isCameraFollowing.value = true
        mesh.getWorldPosition(lastTargetPosition)
        // * Clear any outlines, as focus is the primary indicator
        outlinedObjects.value = []
        focusAnimation = null
        setCameraDistance(camera.position.distanceTo(controls.target))
      },
    })
  }

  /**
   * ~ Smoothly animates the camera to a high, top-down tactical view
   */
  const enterTacticalView = () => {
    // * Kill existing animations
    if (focusAnimation)
      focusAnimation.kill()
    if (tacticalAnimation)
      tacticalAnimation.kill()

    // * Store the current camera state so we can return to it
    preTacticalCameraState.position.copy(camera.position)
    preTacticalCameraState.target.copy(controls.target)
    preTacticalCameraState.wasFollowing = isCameraFollowing.value

    isCameraFollowing.value = false

    const startCamPos = camera.position.clone()
    const startTargetPos = controls.target.clone()

    // * Define the end state for the tactical view
    const endTargetPos = new Vector3(0, 0, 0) // ? look at the center of the solar system
    const endCamPos = new Vector3(0, TACTICAL_VIEW_HEIGHT, 0) // ? position high above

    const proxy = { progress: 0 }

    tacticalAnimation = gsap.to(proxy, {
      progress: 1,
      duration: 2.0,
      ease: 'power3.inOut',
      onUpdate() {
        camera.position.copy(startCamPos).lerp(endCamPos, proxy.progress)
        controls.target.copy(startTargetPos).lerp(endTargetPos, proxy.progress)
        setCameraDistance(camera.position.distanceTo(controls.target))
      },
      onComplete() {
        isTacticalViewActive.value = true
        tacticalAnimation = null
        setCameraDistance(camera.position.distanceTo(controls.target))
      },
    })
  }

  /**
   * ~ Smoothly animates the camera from the tactical view back to its previous state
   */
  const exitTacticalView = () => {
    if (tacticalAnimation)
      tacticalAnimation.kill()

    const startCamPos = camera.position.clone()
    const startTargetPos = controls.target.clone()

    // * Determine the state to return to
    const endCamPos = preTacticalCameraState.position.length() > 0
      ? preTacticalCameraState.position.clone()
      : new Vector3(cameraInitialPosition.x, cameraInitialPosition.y, cameraInitialPosition.z)

    const endTargetPos = preTacticalCameraState.target.length() > 0
      ? preTacticalCameraState.target.clone()
      : new Vector3(0, 0, 0)

    const proxy = { progress: 0 }

    tacticalAnimation = gsap.to(proxy, {
      progress: 1,
      duration: 2.0,
      ease: 'power3.inOut',
      onUpdate() {
        camera.position.copy(startCamPos).lerp(endCamPos, proxy.progress)
        controls.target.copy(startTargetPos).lerp(endTargetPos, proxy.progress)
        setCameraDistance(camera.position.distanceTo(controls.target))
      },
      onComplete() {
        isTacticalViewActive.value = false
        // * Restore following state if it was active before entering tactical view
        if (preTacticalCameraState.wasFollowing) {
          isCameraFollowing.value = true
        }
        tacticalAnimation = null
        setCameraDistance(camera.position.distanceTo(controls.target))
      },
    })
  }

  /**
   * ~ Toggles the camera between the normal view and the tactical view
   */
  const toggleTacticalView = () => {
    if (isTacticalViewActive.value) {
      exitTacticalView()
    }
    else {
      enterTacticalView()
    }
  }

  /**
   * ~ Smoothly resets the camera to its initial default position and orientation
   */
  const resetCamera = () => {
    // * Kill any active animations
    if (focusAnimation) {
      focusAnimation.kill()
      focusAnimation = null
    }
    if (tacticalAnimation) {
      tacticalAnimation.kill()
      tacticalAnimation = null
    }

    // * Reset all state flags
    isCameraFollowing.value = false
    isTacticalViewActive.value = false
    controls.enabled = true

    gsap.to(camera.position, { ...cameraInitialPosition, duration: 1.5, ease: 'power3.inOut' })
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut' })
  }

  /**
   * ~ Updates the camera position to follow the selected body
   * This function should be called in the main animation loop
   */
  const update = () => {
    // * Only update if following mode is active and a body is selected
    if (isCameraFollowing.value && selectedBody.value?.mesh) {
      const currentTargetPosition = new Vector3()
      selectedBody.value.mesh.getWorldPosition(currentTargetPosition)

      // * Calculate how much the target has moved since the last frame
      const delta = new Vector3().subVectors(currentTargetPosition, lastTargetPosition)

      // * Apply this delta to the camera's position to make it move with the target
      camera.position.add(delta)

      // * Update the orbit control's target to the new position
      controls.target.copy(currentTargetPosition)

      // * Store the new position for the next frame's calculation
      lastTargetPosition.copy(currentTargetPosition)
    }
  }

  return {
    isFollowing: isCameraFollowing,
    isTacticalView: isTacticalViewActive,
    lastTargetPosition,
    focusOnBody,
    resetCamera,
    enterTacticalView,
    exitTacticalView,
    toggleTacticalView,
    update,
  }
}
