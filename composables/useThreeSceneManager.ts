/* eslint-disable perfectionist/sort-imports */
// ~ TYPES
import type { SceneManager, SceneManagerOptions } from '@/types/scene.types'
import type { Mesh, Object3D, Points } from 'three'

// ~ VUE
import { onMounted, onUnmounted, ref, shallowRef, toRaw, watch } from 'vue'

// ~ THREE.JS
import { AmbientLight, Clock, MathUtils, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three'

// ~ THREE.JS ADDONS
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// ~ EXTERNAL COMPOSABLES
import { useCelestialBodyFactory } from '@/composables/useCelestialBodyFactory'
import { useSolarSystemData } from '@/composables/useSolarSystemData'
import { useStarfield } from '@/composables/useStarfield'
import { useZoomManager } from '@/composables/useZoomManager'
import { useDebugActions } from '@/composables/useVisualisation'
import { celestialBodies, orbits } from '@/composables/visualisationState'
import { useInteractionManager } from '@/composables/useInteractionManager'
import { outlineColor, outlinedObjects, outlineParams } from '@/composables/effectsState'
import { useCameraManager } from '@/composables/useCameraManager'
import { selectedBody } from '@/composables/interactionState'

// ~ CONFIGS
import { kmPerAu, scaleFactors, timeConfig } from '@/configs/scaling.config'
import { zoomThresholds } from '@/configs/zoom.config'

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
 * # Composable for managing a 3JS core scene components, Celestial bodies, starfield + lifecycle handling
 * @param options - Configuration options for the scene manager
 * @returns - SceneManager instance with scene, camera, renderer and control methods
 */

export function useThreeSceneManager(options: SceneManagerOptions): SceneManager {
  // * Core Three.js components
  const scene = new Scene()
  const camera = new PerspectiveCamera(
    options.fov ?? cameraConfigDefault.fov,
    1,
    options.near ?? cameraConfigDefault.near,
    options.far ?? cameraConfigDefault.far,
  )
  const clock = new Clock()

  let renderer: WebGLRenderer | null = null
  let controls: OrbitControls | null = null
  let composer: EffectComposer | null = null
  let outlinePass: OutlinePass | null = null
  let cameraManager: ReturnType<typeof useCameraManager> | null = null
  let interactionManager: {
    init: () => void
    dispose: () => void
    checkHoverIntersection: () => void
  } | null = null

  // * State management
  const isSceneBaseInit = ref(false)
  const isSceneContentsInit = ref(false)
  let animationFrameId: number | null = null
  let simulatedTime = 0

  // * Scene objects management
  const starfield = shallowRef<Points | null>(null)
  const sun = shallowRef<Mesh | null>(null)
  const earth = shallowRef<Mesh | null>(null)
  const earthOrbit = shallowRef<Object3D | null>(null)
  const moon = shallowRef<Mesh | null>(null)
  const moonOrbit = shallowRef<Object3D | null>(null)

  // * Solar system data management
  const { data: solarSystemData, loadData: loadSolarSystemData } = useSolarSystemData()
  const { createSun, createPlanet, createOrbit, updateOrbit, cleanup: cleanupCelestialBodies } = useCelestialBodyFactory()
  const { setZoomLevel } = useZoomManager()
  const { registerCelestialBody, registerOrbit } = useDebugActions()

  /**
   * # Initialize the scene
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

    // * Camera manager
    cameraManager = useCameraManager(camera, controls)
    // eslint-disable-next-line ts/no-use-before-define
    setupCameraWatchers()

    // * Post-processing
    composer = new EffectComposer(renderer)

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera)
    composer.addPass(outlinePass)

    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    // configure outline pass
    outlinePass.edgeStrength = outlineParams.edgeStrength
    outlinePass.edgeGlow = outlineParams.edgeGlow
    outlinePass.edgeThickness = outlineParams.edgeThickness
    outlinePass.pulsePeriod = outlineParams.pulsePeriod
    outlinePass.visibleEdgeColor.set(outlineColor.value)
    outlinePass.hiddenEdgeColor.set(outlineColor.value)
    // eslint-disable-next-line ts/no-use-before-define
    setupEffectWatchers()

    // * Interactions
    interactionManager = useInteractionManager(scene, camera, renderer, celestialBodies)
    interactionManager.init()

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
   * # Watch for changes in effects state and update the OutlinePass
   */
  const setupEffectWatchers = () => {
    if (!outlinePass)
      return

    if (renderer) {
      // * watch for changes in outlinedObjects
      watch(outlinedObjects, (newOutlinedObjects) => {
        // console.warn(`[FINAL_CHECK] Renderer received objects:`, newOutlinedObjects)
        if (outlinePass) {
          // Convert the Vue proxy and its children to a raw array for 3JS
          outlinePass.selectedObjects = toRaw(newOutlinedObjects).map(obj => toRaw(obj))
        }
      }, { deep: true })

      // * watch for changes in outlineColor
      watch(outlineColor, (newColor) => {
        if (outlinePass) {
          outlinePass.visibleEdgeColor.set(newColor)
          outlinePass.hiddenEdgeColor.set(newColor)
        }
      })
    }
  }

  /**
   * # Watch for changes in camera state and trigger camera actions
   */
  const setupCameraWatchers = () => {
    if (!cameraManager)
      return

    watch(selectedBody, (newBody) => {
      if (newBody)
        cameraManager?.focusOnBody(newBody)

      else
        cameraManager?.resetCamera()
    })
  }

  /**
   * # Load data and create scene contents (starfield, celestial bodies, orbits)
   */
  const initSceneContents = async () => {
    if (!isSceneBaseInit.value) {
      console.error('Base scene not initialized. Call initBaseScene first.')
      return
    }

    // * Starfield setup
    const { starfield: createdStarfield } = useStarfield(scene, starfieldConfig)
    starfield.value = createdStarfield

    // * Load solar system data
    await loadSolarSystemData()

    if (solarSystemData.value && solarSystemData.value.sun) {
      // * Create Sun
      sun.value = await createSun(solarSystemData.value.sun)
      // console.warn('DEBUG --> : Sun mesh created:', sun.value)

      if (sun.value) {
        sun.value.userData.id = solarSystemData.value.sun.id // ? id for raycasting
        scene.add(sun.value)
        registerCelestialBody('sun', 'Sun', sun.value)
        // console.warn('DEBUG --> : Is Sun mesh\'s parent the main scene?', sun.value.parent === scene)
      }

      // sun's scaled radius
      const sunPhysicalRadiusKm = Number.parseFloat(solarSystemData.value.sun.physicalProps.meanRadius)
      const sunScaledRadius = sunPhysicalRadiusKm / scaleFactors.celestialBodyKmPerUnit
      // console.warn(`DEBUG --> : Sun physical radius (km): ${sunPhysicalRadiusKm}, Sun scaled radius (3JS units): ${sunScaledRadius.toFixed(2)}`)

      // * Create Earth and its orbit
      const earthData = solarSystemData.value.planets.earth

      if (earthData) {
        earth.value = await createPlanet(earthData)
        if (earth.value) {
          earth.value.userData.id = earthData.id // ? id for raycasting
          registerCelestialBody('earth', 'Earth', earth.value)
          // console.warn('DEBUG --> : Earth mesh created:', earth.value)
        }

        // earth's astronomical orbital distance (center to center)
        const earthAstronomicalOrbitKm = Number.parseFloat(earthData.orbitalProps.semiMajorAxis)
        const earthOrbitRadius = (earthAstronomicalOrbitKm / kmPerAu) / scaleFactors.orbitalDistanceAuPerUnit
        const earthOrbitInclination = Number.parseFloat(solarSystemData.value.sun.physicalProps.axialTilt)

        earthOrbit.value = createOrbit(
          earthAstronomicalOrbitKm,
          sunScaledRadius,
        )

        earthOrbit.value.rotation.x = MathUtils.degToRad(earthOrbitInclination)
        // console.warn('DEBUG --> : Earth orbit object created:', earthOrbit.value)

        if (earth.value && earthOrbit.value) {
          earthOrbit.value.add(earth.value)
          registerOrbit(
            'earth-orbit',
            'Earth Orbit',
            earthOrbit.value,
            earthOrbitRadius,
            earthOrbitInclination,
          )
          scene.add(earthOrbit.value)
          // console.warn('DEBUG --> : Is Earth mesh\'s parent the Earth orbit object?', earth.value.parent === earthOrbit.value)
          // console.warn('DEBUG --> : Is Earth orbit\'s parent the main scene?', earthOrbit.value.parent === scene)
        }

        // * Create Moon
        const moonData = solarSystemData.value.planets.earth.moons.moon

        if (moonData) {
          moon.value = await createPlanet(moonData)
          // console.warn('DEBUG --> : Moon mesh created:', moon.value)
          if (moon.value) {
            moon.value.userData.id = moonData.id // ? id for raycasting
            registerCelestialBody('moon', 'Moon', moon.value)
          }

          // moon's astronomical orbital distance (center to center)
          const moonAstronomicalOrbitKm = Number.parseFloat(moonData.orbitalProps.semiMajorAxis)
          const moonOrbitRadius = moonAstronomicalOrbitKm / scaleFactors.celestialBodyKmPerUnit
          const moonOrbitInclination = Number.parseFloat(moonData.orbitalProps.inclination)

          // earth's scaled radius
          const earthPhysicalRadiusKm = Number.parseFloat(earthData.physicalProps.meanRadius)
          const earthScaledRadius = earthPhysicalRadiusKm / scaleFactors.celestialBodyKmPerUnit

          moonOrbit.value = createOrbit(
            moonAstronomicalOrbitKm,
            earthScaledRadius,
          )
          // console.warn('DEBUG --> : Moon orbit object created:', moonOrbit.value)

          if (moon.value && moonOrbit.value) {
            moonOrbit.value.add(moon.value)
            registerOrbit(
              'moon-orbit',
              'Moon Orbit',
              moonOrbit.value,
              moonOrbitRadius,
              moonOrbitInclination,
            )
            scene.add(moonOrbit.value)
            // console.warn('DEBUG --> : Is Moon mesh\'s parent the Moon orbit object?', moon.value.parent === moonOrbit.value)
            // console.warn('DEBUG --> : Is Moon orbit\'s parent the Earth mesh?', moonOrbit.value.parent === earth.value)
          }
        }
        else {
          console.error('Moon data not found in solarSystemData.value.planets.earth.moons')
        }
      }
      else {
        console.error('Earth data not found in solarSystemData.value.planets')
      }

      // TODO: loop through other planets and create them similarly
    }
    else {
      console.error('solarSystemData.value or solarSystemData.value.sun is null or undefined in initSceneContents')
    }
    console.warn('DEBUG --> [SceneManager] Reached the end of initSceneContents.')
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
    renderer?.setSize(window.innerWidth, window.innerHeight)
    composer?.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * # Animation loop
   */
  const animate = () => {
    if (!isSceneBaseInit.value || !renderer || !camera || !composer || !controls)
      return

    animationFrameId = requestAnimationFrame(animate)

    // ? get the time elapsed since the last frame (in seconds)
    const deltaTime = clock.getDelta()
    simulatedTime += deltaTime * timeConfig.simulationSpeed

    if (sun.value) {
      sun.value.rotation.y += 0.05 * deltaTime
    }

    if (earth.value && earthOrbit.value && solarSystemData.value?.planets.earth) {
      const orbitalPeriod = Number.parseFloat(
        solarSystemData.value.planets.earth.orbitalProps.orbitalPeriod,
      )

      const semiMajorAxis = (
        Number.parseFloat(
          solarSystemData.value.planets.earth.orbitalProps.semiMajorAxis,
        ) / kmPerAu
      ) / scaleFactors.orbitalDistanceAuPerUnit

      updateOrbit(earthOrbit.value, simulatedTime, orbitalPeriod, semiMajorAxis)

      // ? synchronize orbital helper host position
      const earthOrbitState = orbits.value.find(orbit => orbit.id === 'earth-orbit')
      if (earthOrbitState)
        earthOrbitState.orbitalHelperHost.position.copy(earth.value.position)
    }

    if (moon.value && earth.value && moonOrbit.value && solarSystemData.value?.planets.earth.moons.moon) {
      // ? manually update the Moon's orbital pivot to follow the Earth's world position
      moonOrbit.value.position.copy(earth.value.getWorldPosition(new Vector3()))

      const moonOrbitalPeriod = Number.parseFloat(
        solarSystemData.value.planets.earth.moons.moon.orbitalProps.orbitalPeriod,
      )

      const moonSemiMajorAxis = Number.parseFloat(
        solarSystemData.value.planets.earth.moons.moon.orbitalProps.semiMajorAxis,
      ) / scaleFactors.localOrbitalDistanceKmPerUnit

      updateOrbit(moonOrbit.value, simulatedTime, moonOrbitalPeriod, moonSemiMajorAxis)

      // ? synchronize orbital helper host position
      const moonOrbitState = orbits.value.find(orbit => orbit.id === 'moon-orbit')
      if (moonOrbitState)
        moonOrbitState.orbitalHelperHost.position.copy(moon.value.position)
    }

    // * Check for hover intersection
    interactionManager?.checkHoverIntersection()

    // * Update camera manager
    if (cameraManager?.isFollowing.value && selectedBody.value?.mesh && controls) {
      const currentTargetPosition = new Vector3()
      selectedBody.value.mesh.getWorldPosition(currentTargetPosition)

      // ? calculate how much the target has moved since the last frame
      const delta = new Vector3().subVectors(currentTargetPosition, cameraManager.lastTargetPosition)

      // ? apply this delta to the camera's current position to make it move with the target
      camera.position.add(delta)

      // ? update the control's target to the new position
      controls.target.copy(currentTargetPosition)

      // ? store the new position for the next frame's calculation
      cameraManager.lastTargetPosition.copy(currentTargetPosition)
    }

    // * Update controls
    controls?.update()

    // * Update zoom level
    if (controls) {
      const distance = camera.position.distanceTo(controls.target)

      // calculate zoom level based on zoom.config.ts
      const thresholdIndex = zoomThresholds.findIndex(threshold => distance < threshold)
      const newZoomLevel = thresholdIndex === -1 ? 0 : zoomThresholds.length - thresholdIndex
      setZoomLevel(newZoomLevel)
    }

    // TODO: Add animation updates for other celestial bodies

    composer?.render()
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

    // * Dispose of interaction manager
    interactionManager?.dispose()

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
