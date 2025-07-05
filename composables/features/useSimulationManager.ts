/**
 * @module useSimulationManager
 * @description This module manages the dynamic aspects of the scene, such as the rotation of planets
 * and their movement along orbital paths. It uses a time-based approach to ensure that the
 * simulation is smooth and independent of the frame rate.
 */
import type { Object3D } from 'three'
import * as THREE from 'three'
import { useSolarSystemData } from '~/composables/data/useSolarSystemData'
import { celestialBodies, orbits } from '~/composables/state/visualisationState'

/**
 * @private
 * @interface OrbitalData
 * @property {number} orbitalPeriod - The time it takes for a body to complete one orbit, in days.
 */
interface OrbitalData {
  orbitalPeriod: number
}

// ~ --- Module-level state ---

/**
 * @private
 * @type {Map<string, OrbitalData>}
 * A map to store the orbital period for each celestial body, keyed by the body's ID.
 * This provides fast lookups during the simulation update.
 */
const orbitalDataMap = new Map<string, OrbitalData>()

/**
 * @private
 * @type {THREE.PointLight | null}
 * A cached reference to the sun's PointLight object, to avoid searching the scene graph on every frame.
 */
let sunLight: THREE.PointLight | null = null
/**
 * @private
 * @type {THREE.Vector3}
 * A pre-allocated Vector3 to store the light's world position, avoiding object creation in the animation loop.
 */
const lightWorldPosition = new THREE.Vector3()

/**
 * ~ Calculates and applies the new position of a celestial body within its orbit for a given time
 *
 * @private
 * @param {Object3D} pivot - The orbital pivot `Object3D` for the celestial body.
 * @param {number} time - The current simulated time.
 * @param {number} orbitalPeriod - The orbital period of the body in days.
 */
function _updateOrbitPosition(pivot: Object3D, time: number, orbitalPeriod: number) {
  // The first child of the pivot is the "system" group containing the celestial body.
  const bodyToOrbit = pivot.children[0]
  if (!bodyToOrbit)
    return

  // Calculate the current angle of the body in its orbit.
  const angularSpeed = (2 * Math.PI) / orbitalPeriod
  const angle = time * angularSpeed

  // The orbital radius is stored in the pivot's userData.
  const semiMajorAxis = pivot.userData.orbitRadius

  // Update the position of the body on the X-Z plane based on the angle and radius.
  bodyToOrbit.position.x = Math.cos(angle) * semiMajorAxis
  bodyToOrbit.position.z = Math.sin(angle) * semiMajorAxis
}

/**
 * # A composable function that provides methods to initialize and update the scene simulation
 *
 * @returns {object} An object containing the `initialize` and `update` functions.
 */
export function useSimulationManager() {
  const { data: solarSystemData } = useSolarSystemData()

  /**
   * ~ Initializes the simulation manager by populating the `orbitalDataMap`
   * with orbital periods from the loaded solar system data
   */
  const initialize = () => {
    if (!solarSystemData.value) {
      console.error('Simulation Manager: Solar system data not loaded.')
      return
    }

    orbitalDataMap.clear()

    // * Extract and store the orbital period for each planet and moon
    for (const planetData of Object.values(solarSystemData.value.planets)) {
      if (planetData.orbitalProps?.orbitalPeriod) {
        orbitalDataMap.set(planetData.id, {
          orbitalPeriod: Number.parseFloat(planetData.orbitalProps.orbitalPeriod),
        })
      }
      for (const moonData of Object.values(planetData.moons || {})) {
        if (moonData.orbitalProps?.orbitalPeriod) {
          orbitalDataMap.set(moonData.id, {
            orbitalPeriod: Number.parseFloat(moonData.orbitalProps.orbitalPeriod),
          })
        }
      }
    }
    console.warn('%c[SIMULATION] Simulation data prepared.', 'color: orange; font-weight: bold;')
  }

  /**
   * ~ Updates the state of the simulation for the current frame
   * This includes updating axial rotations and orbital positions
   *
   * @param {number} simulatedTime - The total simulated time that has passed.
   * @param {number} deltaTime - The time elapsed since the last frame.
   */
  const update = (simulatedTime: number, deltaTime: number) => {
    // * 1. Update axial rotations for bodies like the Sun and Earth
    const sunState = celestialBodies.value.find(body => body.name.toLowerCase() === 'sun')
    const earthState = celestialBodies.value.find(body => body.name.toLowerCase() === 'earth')

    // * Find the sun's light source once and cache it for performance
    if (sunState && !sunLight)
      sunLight = sunState.mesh.getObjectByProperty('type', 'PointLight') as THREE.PointLight | null

    // * Update the Earth's custom shader with the sun's current position to correctly render the day/night cycle
    if (earthState && sunLight) {
      const material = earthState.mesh.material as THREE.MeshStandardMaterial
      if (material.userData.shader) {
        sunLight.getWorldPosition(lightWorldPosition)
        material.userData.shader.uniforms.uLightPosition.value.copy(lightWorldPosition)
      }
    }

    // * Apply simple axial rotation
    if (sunState)
      sunState.mesh.rotation.y += 0.05 * deltaTime

    if (earthState)
      earthState.mesh.rotation.y += 1.25 * deltaTime

    // * 2. Update all orbital positions
    orbits.value.forEach((orbit) => {
      const data = orbitalDataMap.get(orbit.bodyId)
      if (data) {
        _updateOrbitPosition(orbit.pivot, simulatedTime, data.orbitalPeriod)
      }
    })
  }

  return {
    initialize,
    update,
  }
}
