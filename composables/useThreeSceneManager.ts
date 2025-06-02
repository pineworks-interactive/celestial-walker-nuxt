/* eslint-disable perfectionist/sort-imports */
// ~ TYPES
import type { SceneManager, SceneManagerOptions } from '@/types/scene.types'
import type { Mesh, Object3D, Points } from 'three'

// ~ VUE
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'

// ~ THREE.JS
import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

// ~ THREE.JS ADDONS
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// ~ EXTERNAL COMPOSABLES
import { useCelestialBodyFactory } from '@/composables/useCelestialBodyFactory'
import { useSolarSystemData } from '@/composables/useSolarSystemData'
import { useStarfield } from '@/composables/useStarfield'

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
 * ? Composable for managing a Three.js core scene components, Celestial bodies, starfield + lifecycle handling
 * @param options - Configuration options for the scene manager
 * @returns - SceneManager instance with scene, camera, renderer and control methods
 */

export function useThreeSceneManager(options: SceneManagerOptions): SceneManager {
  // * Core Three.js components
  const scene = new Scene()
  const camera = new PerspectiveCamera(
    options.fov ?? cameraConfigDefault.fov,
    1, // ! window.innerWidth / window.innerHeight does not work here, use 1 instead (will be updated in renderer setup)
    options.near ?? cameraConfigDefault.near,
    options.far ?? cameraConfigDefault.far,
  )

  let renderer: WebGLRenderer | null = null
  let controls: OrbitControls | null = null

  // * State management
  const isSceneBaseInit = ref(false)
  const isSceneContentsInit = ref(false)
  let animationFrameId: number | null = null

  // * Scene objects management
  const starfield = shallowRef<Points | null>(null)
  const sun = shallowRef<Mesh | null>(null)
  const earth = shallowRef<Mesh | null>(null)
  const earthOrbit = shallowRef<Object3D | null>(null)

  // * Solar system data management
  const { data: solarSystemData, loadData: loadSolarSystemData } = useSolarSystemData()
  const { createSun, createPlanet, createOrbit, updateOrbit, cleanup: cleanupCelestialBodies } = useCelestialBodyFactory()

  /**
   * # Initialize the scene (basic setup)
   */
  const initBaseScene = () => {
    if (isSceneBaseInit.value)
      return

    const canvasElement = document.getElementById(options.containerId) as HTMLCanvasElement | null

    if (!canvasElement) {
      console.error(`Canvas element with id ${options.containerId} not found`)
      return
    }

    // * Renderer setup
    renderer = new WebGLRenderer({ ...rendererConfig, canvas: canvasElement })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(rendererProps.backgroundColor)

    // * Controls
    controls = new OrbitControls(camera, renderer.domElement)
    Object.assign(controls, controlsConfig)

    // * Camera setup
    camera.position.set(
      cameraInitialPosition.x,
      cameraInitialPosition.y,
      cameraInitialPosition.z,
    )
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    scene.add(camera)

    // * Ambient lighting
    const ambientLight = new AmbientLight(
      ambientLightConfig.color,
      ambientLightConfig.intensity,
    )
    scene.add(ambientLight)

    // * Window resize handler
    // eslint-disable-next-line ts/no-use-before-define
    window.addEventListener('resize', handleResize)

    isSceneBaseInit.value = true
  }

  /**
   * # Load data and create scene contents (starfield, celestial bodies)
   */
  const initSceneContents = async () => {
    if (!isSceneBaseInit.value) {
      console.warn('Base scene not initialized. Call initBaseScene first.')
      return
    }

    // * Starfield setup
    const { starfield: createdStarfield } = useStarfield(scene, starfieldConfig)
    starfield.value = createdStarfield

    // * Load solar system data
    await loadSolarSystemData()

    if (solarSystemData.value) {
      // * Create Sun
      sun.value = await createSun(solarSystemData.value.sun)
      if (sun.value)
        scene.add(sun.value)

      // * Create Earth and its orbit
      const earthData = solarSystemData.value.planets.earth
      if (earthData) {
        earth.value = await createPlanet(earthData)

        earthOrbit.value = createOrbit(
          Number.parseFloat(earthData.orbitalProps.semiMajorAxis),
          0.1,
        )

        if (earth.value && earthOrbit.value) {
          earthOrbit.value.add(earth.value)
          scene.add(earthOrbit.value)
        }
      }
      else {
        console.error('Earth data not found in solarSystemData.value.planets')
      }
      // TODO: Loop through other planets and create them similarly
    }
    else {
      console.error('solarSystemData.value is null or undefined in initSceneContents')
    }
    isSceneContentsInit.value = true
  }

  /**
   * # Full initialization sequence
   */
  const initialize = async () => {
    initBaseScene()
    if (isSceneBaseInit.value) {
      await initSceneContents()
      // eslint-disable-next-line ts/no-use-before-define
      startAnimationLoop()
    }
  }

  /**
   * # Handle window resize events
   */
  const handleResize = () => {
    if (!isSceneBaseInit.value || !renderer || !camera)
      return

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * # Animation loop
   */
  const animate = () => {
    if (!isSceneBaseInit.value || !renderer || !camera)
      return

    animationFrameId = requestAnimationFrame(animate)

    // * Update controls
    controls?.update()

    // * Celestial bodies animation
    if (earth.value && earthOrbit.value) {
      updateOrbit(earth.value, earthOrbit.value)
    }
    // TODO: Add animation updates for other celestial bodies

    renderer.render(scene, camera)
  }

  /**
   * # Animation control methods
   */
  const startAnimationLoop = () => {
    if (!animationFrameId && isSceneBaseInit.value && isSceneContentsInit.value) {
      animate()
    }
  }

  const stopAnimationLoop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  /**
   * # Cleanup function
   */
  const dispose = () => {
    if (!isSceneBaseInit.value && !isSceneContentsInit.value)
      return

    stopAnimationLoop()

    // * Remove window resize listener
    window.removeEventListener('resize', handleResize)

    // * Dispose of controls
    controls?.dispose()

    // * Cleanup celestial bodies
    cleanupCelestialBodies()

    // * Dispose of renderer
    renderer?.dispose()

    // * Reset initialization state
    isSceneBaseInit.value = false
    isSceneContentsInit.value = false
  }

  // # Lifecycle hooks
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
