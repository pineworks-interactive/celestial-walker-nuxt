/**
 * @module useThreeCore
 * @description This module is responsible for initializing the fundamental components of a 3JS scene
 * It encapsulates the creation of the scene, camera, renderer, and orbit controls,
 * providing a clean and reusable foundation for any 3D visualization
 */
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { shallowRef } from 'vue'
import { cameraInitialPosition } from '@/configs/scene.config'

/**
 * # Initializes the core 3JS components (scene, camera, renderer, and controls)
 * This function is designed to be called once, providing the essential building blocks for the 3D environment
 *
 * @param {HTMLCanvasElement} canvas - The HTML canvas element that 3JS will render into
 * @returns {object} An object containing shallow reactive references to the core components (`scene`, `camera`, `renderer`, `controls`)
 *                   and lifecycle functions (`cleanup`, `onResize`)
 */
export function useThreeCore(canvas: HTMLCanvasElement) {
  // * Scene is the container for all 3D objects
  const scene = new Scene()

  // * PerspectiveCamera simulates human-like vision
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000)
  camera.position.set(cameraInitialPosition.x, cameraInitialPosition.y, cameraInitialPosition.z)
  camera.name = 'mainCamera'

  // * WebGLRenderer is responsible for drawing the scene onto the canvas
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true, // ? smooths out edges
    alpha: true, // ? allows for a transparent background
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  // * Ensures the rendering is crisp on high-density displays (like retina screens)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // * OrbitControls allow the user to navigate the scene with the mouse
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // ? creates a smoother, more realistic camera movement
  controls.dampingFactor = 0.05
  controls.minDistance = 10 // ? prevents zooming in too close
  controls.maxDistance = 10000 // ? prevents zooming out too far

  /**
   * ~ Cleans up 3JS resources to prevent memory leaks when the component is unmounted
   * It's crucial to dispose of objects that are no longer needed
   */
  const cleanup = () => {
    renderer.dispose()
    controls.dispose()
    // Note: The scene and camera are automatically garbage-collected by JavaScript
    // once they are no longer referenced, so they don't have explicit dispose methods
  }

  /**
   * ~ Handles window resize events to keep the camera and renderer in sync with the new dimensions
   * This ensures the scene doesn't get stretched or distorted
   */
  const onResize = () => {
    // * Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight
    // * Apply the new aspect ratio
    camera.updateProjectionMatrix()

    // * Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  return {
    // ! We use shallowRef for performance. The internal properties of 3JS objects
    // ! are managed by 3JS itself and don't need to be deeply reactive.
    scene: shallowRef(scene),
    camera: shallowRef(camera),
    renderer: shallowRef(renderer),
    controls: shallowRef(controls),
    cleanup,
    onResize,
  }
}
