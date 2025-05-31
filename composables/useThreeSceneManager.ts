import type { SceneManager, SceneManagerOptions } from '@/types/scene.types'
import {
  AmbientLight,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { onMounted, onUnmounted, ref } from 'vue'
import {
  ambientLightConfig,
  cameraConfigDefault,
  cameraInitialPosition,
  controlsConfig,
  rendererConfig,
} from '~/configs/scene.config'

/**
 * ? Composable for managing a Three.js scene + lifecycle handling
 * @param options - Configuration options for the scene manager
 * @returns - SceneManager instance with scene, camera, and renderer
 */

export function useThreeSceneManager(options: SceneManagerOptions): SceneManager {
  // * Core Three.js components
  const scene = new Scene()
  const camera = new PerspectiveCamera(
    options.fov ?? cameraConfigDefault.fov,
    window.innerWidth / window.innerHeight,
    options.near ?? cameraConfigDefault.near,
    options.far ?? cameraConfigDefault.far,
  )
  const renderer = new WebGLRenderer(rendererConfig)

  // * Controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = controlsConfig.enableDamping // smoothing camera movement
  controls.dampingFactor = controlsConfig.dampingFactor
  controls.screenSpacePanning = controlsConfig.screenSpacePanning
  controls.minDistance = controlsConfig.minDistance
  controls.maxDistance = controlsConfig.maxDistance
  controls.maxPolarAngle = controlsConfig.maxPolarAngle // prevent camera from flipping upside down

  // * State management
  const isInitialized = ref(false)
  let animationFrameId: number | null = null

  /**
   * # Initialize the scene (basic setup)
   */
  const init = () => {
    if (isInitialized.value)
      return

    // * Renderer setup
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    // add renderer to the DOM
    const container = document.getElementById(options.containerId)
    if (!container) {
      console.error(`Container with id ${options.containerId} not found`)
      return
    }
    container.appendChild(renderer.domElement)

    // * Camera setup
    camera.position.set(
      cameraInitialPosition.x,
      cameraInitialPosition.y,
      cameraInitialPosition.z,
    )

    // * Ambient lighting
    const ambientLight = new AmbientLight(
      ambientLightConfig.color,
      ambientLightConfig.intensity,
    )
    scene.add(ambientLight)

    // * Window resize handler
    // eslint-disable-next-line ts/no-use-before-define
    window.addEventListener('resize', handleResize)

    isInitialized.value = true
    // eslint-disable-next-line ts/no-use-before-define
    animate()
  }

  /**
   * # Handle window resize events
   */
  const handleResize = () => {
    if (!isInitialized.value)
      return

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * # Animation loop
   */
  const animate = () => {
    if (!isInitialized.value)
      return

    animationFrameId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  /**
   * # Cleanup function
   */
  const dispose = () => {
    if (!isInitialized.value)
      return

    // cancel animation
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    // remove window resize listener
    window.removeEventListener('resize', handleResize)

    // dispose of controls
    controls.dispose()

    // dispose of three.js resources
    scene.traverse((element) => {
      if (element instanceof Mesh) {
        element.geometry.dispose()
        if (Array.isArray(element.material)) {
          element.material.forEach(material => material.dispose())
        }
        else {
          element.material.dispose()
        }
      }
    })

    // remove renderer from the DOM
    const container = document.getElementById(options.containerId)
    if (container) {
      container.removeChild(renderer.domElement)
    }

    renderer.dispose()
    isInitialized.value = false
  }

  // # Lifecycle hooks
  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    dispose()
  })

  return {
    scene,
    camera,
    renderer,
    controls,
    isInitialized: isInitialized.value,
    init,
    dispose,
    animate,
  }
}
