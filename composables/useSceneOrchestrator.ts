/**
 * @module useSceneOrchestrator
 * @description This module acts as the central orchestrator for the entire 3JS scene.
 * It is responsible for initializing all core components, loading scene contents, managing managers
 * (like camera, interaction, simulation), and handling the main lifecycle hooks (setup, mounting, unmounting).
 * It brings together all the other composables into a cohesive application.
 */
/* eslint-disable perfectionist/sort-imports */
// ~ TYPES
import type { SceneManager, SceneManagerOptions } from '@/types/scene.types'
import type { Points } from 'three'

// ~ VUE
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

// ~ 3JS
import * as THREE from 'three'
import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

// ~ 3JS ADDONS
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// ~ EXTERNAL COMPOSABLES
import { useCelestialBodyFactory } from '@/composables/factories/useCelestialBodyFactory'
import { useStarfield } from '@/composables/features/useStarfield'
import { useZoomManager } from '@/composables/features/useZoomManager'
import { celestialBodies } from '@/composables/state/visualisationState'
import { useInteractionManager } from '@/composables/features/useInteractionManager'
import { useCameraManager } from '@/composables/features/useCameraManager'
import { selectedBody } from '@/composables/state/interactionState'
import { registerTacticalViewToggle } from '@/composables/features/useTacticalView'
import { useSceneLoader } from '@/composables/features/useSceneLoader'
import { usePostProcessing } from '@/composables/core/usePostProcessing'
import type { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { useSimulationManager } from '@/composables/features/useSimulationManager'
import { useAnimationLoop } from '@/composables/core/useAnimationLoop'

// ~ CONFIGS
import {
  ambientLightConfig,
  cameraConfigDefault,
  cameraInitialPosition,
  controlsConfig,
  rendererConfig,
  rendererProps,
  starfieldConfig,
} from '@/configs/scene.config'

/**
 * # The main composable for creating and managing the entire 3JS scene and its related functionalities
 *
 * @param {SceneManagerOptions} options - Configuration options for the scene manager, primarily the ID of the canvas container
 * @returns {SceneManager} An instance containing the core 3JS components and lifecycle methods (`init`, `dispose`)
 */
export function useSceneOrchestrator(options: SceneManagerOptions): SceneManager {
  // * --- Core 3JS components ---

  const scene = new Scene()
  const camera = new PerspectiveCamera(
    options.fov ?? cameraConfigDefault.fov,
    1,
    options.near ?? cameraConfigDefault.near,
    options.far ?? cameraConfigDefault.far,
  )

  let renderer: WebGLRenderer | null = null
  let controls: OrbitControls | null = null
  let composer: EffectComposer | null = null
  let cameraManager: ReturnType<typeof useCameraManager> | null = null
  let interactionManager: ReturnType<typeof useInteractionManager> | null = null

  // * --- State management ---

  // * A flag to track if the basic scene infrastructure (renderer, camera, controls) has been initialized
  const isSceneBaseInit = ref(false)
  // * A flag to track if the scene's content (planets, stars) has been loaded
  const isSceneContentsInit = ref(false)

  // * --- Scene objects and managers ---

  const starfield = shallowRef<Points | null>(null)
  const { cleanup: cleanupCelestialBodies } = useCelestialBodyFactory()
  const zoomManager = useZoomManager()
  const { load: loadScene } = useSceneLoader()
  const simulationManager = useSimulationManager()
  let animationLoop: ReturnType<typeof useAnimationLoop> | null = null

  /**
   * ~ Initializes the core scene infrastructure: renderer, controls, camera, lights, and event listeners
   * This function should only be run once
   */
  const initBaseScene = () => {
    if (isSceneBaseInit.value)
      return

    const canvasElement = document.getElementById(options.containerId) as HTMLCanvasElement | null

    if (!canvasElement) {
      console.error(`Canvas element with id ${options.containerId} not found`)
      return
    }

    // * 1. Renderer: Renders the scene onto the canvas
    renderer = new WebGLRenderer({ ...rendererConfig, canvas: canvasElement })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(rendererProps.backgroundColor)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // * 2. Controls: Allows user navigation
    controls = new OrbitControls(camera, renderer.domElement)
    Object.assign(controls, controlsConfig)

    // * 3. Camera Manager: Handles complex camera movements
    cameraManager = useCameraManager(camera, controls)
    // eslint-disable-next-line ts/no-use-before-define
    setupCameraWatchers()
    registerTacticalViewToggle(cameraManager.toggleTacticalView)

    // * 4. Post-processing: Manages visual effects like bloom and outlines
    // * We create a temporary object that mimics the structure of `useThreeCore`'s return value
    const tempThreeCore = {
      scene: shallowRef(scene),
      camera: shallowRef(camera),
      renderer: shallowRef(renderer),
      controls: shallowRef(controls),
      cleanup: () => {},
      onResize: () => {},
    }
    const postProcessing = usePostProcessing(tempThreeCore)
    composer = postProcessing.composer

    // * 5. Interaction Manager: Handles mouse and keyboard inputs
    interactionManager = useInteractionManager(scene, camera, renderer, celestialBodies)
    interactionManager.init()

    // * 6. Camera Setup: Final position and projection matrix update
    camera.position.set(
      cameraInitialPosition.x,
      cameraInitialPosition.y,
      cameraInitialPosition.z,
    )
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    scene.add(camera)

    // * 7. Lighting: Basic ambient light for the scene
    const ambientLight = new AmbientLight(
      ambientLightConfig.color,
      ambientLightConfig.intensity,
    )
    scene.add(ambientLight)

    // * 8. Event Listeners: Handle window resizing
    // eslint-disable-next-line ts/no-use-before-define
    window.addEventListener('resize', handleResize)

    isSceneBaseInit.value = true
  }

  /**
   * ~ Sets up watchers that trigger camera actions based on interaction state changes
   * Specifically, it watches the `selectedBody` state to focus or reset the camera
   */
  const setupCameraWatchers = () => {
    if (!cameraManager)
      return

    watch(selectedBody, (newBody) => {
      // * If a new body is selected, focus the camera on it
      if (newBody)
        cameraManager?.focusOnBody(newBody)
      // * If the selection is cleared, reset the camera to its default position
      else
        cameraManager?.resetCamera()
    })
  }

  /**
   * ~ Loads the actual content of the scene, such as the starfield and the solar system
   * This is called after the base scene is initialized
   */
  const initSceneContents = async () => {
    if (!isSceneBaseInit.value) {
      console.error('Base scene not initialized. Call initBaseScene first.')
      return
    }

    // * Create the procedural starfield background
    const { starfield: createdStarfield } = useStarfield(scene, starfieldConfig)
    starfield.value = createdStarfield

    // * Load all celestial bodies, orbits, moons, etc., using the scene loader
    await loadScene(scene)

    // * Initialize the simulation manager with the now-loaded data
    simulationManager.initialize()

    isSceneContentsInit.value = true
  }

  /**
   * ~ The main initialization function that runs the entire setup sequence
   */
  const initialize = async () => {
    initBaseScene()
    if (isSceneBaseInit.value) {
      await initSceneContents()
      // * Once everything is loaded and set up, start the animation loop
      // eslint-disable-next-line ts/no-use-before-define
      startAnimationLoop()
    }
  }

  /**
   * ~ Handles window resize events to keep the renderer and camera aspect ratio in sync
   */
  const handleResize = () => {
    if (!isSceneBaseInit.value || !renderer || !camera)
      return

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer?.setSize(window.innerWidth, window.innerHeight)
    composer?.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * ~ Starts the main animation loop
   */
  const startAnimationLoop = () => {
    // * Ensure the loop isn't already running and that all components are initialized
    if (!animationLoop && isSceneBaseInit.value && isSceneContentsInit.value) {
      if (!renderer || !controls || !composer || !cameraManager || !interactionManager) {
        console.error('Cannot start animation loop: required components not initialized')
        return
      }

      // * Create the `threeCore` object required by the animation loop
      const threeCore = {
        scene: shallowRef(scene),
        camera: shallowRef(camera),
        renderer: shallowRef(renderer),
        controls: shallowRef(controls),
        cleanup: () => {},
        onResize: () => {},
      }

      animationLoop = useAnimationLoop(
        threeCore,
        composer,
        cameraManager,
        simulationManager,
        interactionManager,
        zoomManager,
      )
      animationLoop.start()
    }
  }

  /**
   * ~ Stops the main animation loop
   */
  const stopAnimationLoop = () => {
    animationLoop?.stop()
    animationLoop = null
  }

  /**
   * ~ Cleans up all resources to prevent memory leaks when the scene is no longer needed
   * This includes disposing of the renderer, controls, and custom managers, and stopping the animation loop
   */
  const dispose = () => {
    if (!isSceneBaseInit.value && !isSceneContentsInit.value)
      return

    stopAnimationLoop()

    // * Remove event listeners
    window.removeEventListener('resize', handleResize)

    // * Dispose of 3JS objects
    controls?.dispose()

    // * Clean up all generated celestial bodies
    cleanupCelestialBodies()

    // * Dispose of custom managers
    interactionManager?.dispose()

    // * Dispose of the renderer
    renderer?.dispose()

    // * Reset initialization state flags
    isSceneBaseInit.value = false
    isSceneContentsInit.value = false
  }

  // * This ensures that the entire scene setup and teardown process
  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    dispose()
  })

  return {
    scene,
    camera,
    renderer,
    controls,
    isSceneBaseInit,
    isSceneContentsInit,
    init: initialize,
    dispose,
  }
}
