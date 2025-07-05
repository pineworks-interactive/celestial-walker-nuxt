/**
 * @module useVisualisation
 * @description This module provides a set of functions for controlling debug visualizations in the scene.
 * It allows toggling of wireframes, axes helpers, and grid helpers for both individual celestial bodies
 * and orbits, as well as globally for the entire scene. It also includes the registration functions
 * used by the scene loader to populate the reactive state arrays.
 */
import type { Line, Mesh } from 'three'
import { AxesHelper, GridHelper, Material, MathUtils, Object3D } from 'three'
import {
  celestialBodies,
  globalAxes,
  globalGrids,
  globalWireframe,
  orbits,
} from '~/composables/state/visualisationState'

// # --- Private Helper Functions ---

/**
 * ~ Finds a celestial body state by its ID from the global state
 * @private
 */
const _findBody = (id: string) => celestialBodies.value.find(body => body.id === id)
/**
 * ~ Finds an orbit state by its ID from the global state
 * @private
 */
const _findOrbit = (id: string) => orbits.value.find(orbit => orbit.id === id)

/**
 * ~ Toggles the visibility of a 3JS helper object (like `AxesHelper` or `GridHelper`)
 *
 * @private
 * @param {AxesHelper | GridHelper | undefined} helper - The helper object to toggle
 * @param {boolean} shouldBeVisible - The desired visibility state
 * @param {Object3D} parent - The parent `Object3D` to which the helper should be added or from which it should be removed
 */
function _toggleHelperVisibility(helper: AxesHelper | GridHelper | undefined, shouldBeVisible: boolean, parent: Object3D) {
  if (shouldBeVisible) {
    if (helper) {
      // * Setting depthTest to false makes the helper visible through other objects
      if (helper.material instanceof Material) {
        helper.material.depthTest = false
        helper.material.needsUpdate = true
      }
      parent.add(helper)
    }
  }
  else {
    if (helper) {
      parent.remove(helper)
    }
  }
}

// # --- Public Action Functions ---

/**
 * ~ Toggles the wireframe property for a specific celestial body's material
 *
 * @param {string} id - The ID of the celestial body
 */
export function toggleBodyWireframe(id: string) {
  const body = _findBody(id)
  if (body) {
    const material = body.mesh.material
    if (material) {
      body.isWireframe = !body.isWireframe
      // * Handle both single and multi-material objects
      if (Array.isArray(material)) {
        material.forEach((m) => {
          if ('wireframe' in m) {
            (m as { wireframe: boolean }).wireframe = body.isWireframe
          }
        })
      }
      else {
        if ('wireframe' in material) {
          (material as { wireframe: boolean }).wireframe = body.isWireframe
        }
      }
    }
  }
}

/**
 * ~ Toggles the visibility of the `AxesHelper` for a specific celestial body
 *
 * @param {string} id - The ID of the celestial body
 * @param {boolean} [forced] - An optional boolean to force a specific state (true for visible, false for hidden)
 */
export function toggleBodyAxisHelper(id: string, forced?: boolean) {
  const body = _findBody(id)
  if (body) {
    // If a forced state is provided, use it. Otherwise, toggle the current state.
    body.hasAxesHelpers = forced ?? !body.hasAxesHelpers
    _toggleHelperVisibility(body.axesHelper, body.hasAxesHelpers, body.mesh)
  }
}

/**
 * ~ Toggles the visibility of the `GridHelper` for a specific celestial body
 *
 * @param {string} id - The ID of the celestial body
 * @param {boolean} [forced] - An optional boolean to force a specific state
 */
export function toggleBodyGridHelper(id: string, forced?: boolean) {
  const body = _findBody(id)
  if (body) {
    body.hasGridHelpers = forced ?? !body.hasGridHelpers
    _toggleHelperVisibility(body.gridHelper, body.hasGridHelpers, body.mesh)
  }
}

/**
 * ~ Toggles the visibility of the `AxesHelper` for a specific orbit
 *
 * @param {string} id - The ID of the orbit (e.g., "earth_orbit")
 * @param {boolean} [forced] - An optional boolean to force a specific state
 */
export function toggleOrbitAxisHelper(id: string, forced?: boolean) {
  const orbit = _findOrbit(id)
  if (orbit) {
    orbit.hasAxesHelpers = forced ?? !orbit.hasAxesHelpers
    _toggleHelperVisibility(orbit.axesHelper, orbit.hasAxesHelpers, orbit.orbitalHelperHost)
  }
}

/**
 * ~ Toggles the visibility of the `GridHelper` for a specific orbit
 *
 * @param {string} id - The ID of the orbit.
 * @param {boolean} [forced] - An optional boolean to force a specific state
 */
export function toggleOrbitGridHelper(id: string, forced?: boolean) {
  const orbit = _findOrbit(id)
  if (orbit) {
    orbit.hasGridHelpers = forced ?? !orbit.hasGridHelpers
    _toggleHelperVisibility(orbit.gridHelper, orbit.hasGridHelpers, orbit.orbitalHelperHost)
  }
}

/**
 * ~ Toggles the global wireframe state for all celestial bodies in the scene
 */
export function toggleGlobalWireframe() {
  globalWireframe.value = !globalWireframe.value
  // * Iterate through all bodies and set their wireframe state to the new global state
  celestialBodies.value.forEach(body => (toggleBodyWireframe(body.id)))
}

/**
 * ~ Toggles the global `AxesHelper` visibility for all celestial bodies and orbits
 */
export function toggleGlobalAxes() {
  globalAxes.value = !globalAxes.value
  // * Force the state of all helpers to match the new global state
  celestialBodies.value.forEach(body => toggleBodyAxisHelper(body.id, globalAxes.value))
  orbits.value.forEach(orbit => toggleOrbitAxisHelper(orbit.id, globalAxes.value))
}

/**
 * ~ Toggles the global `GridHelper` visibility for all celestial bodies and orbits
 */
export function toggleGlobalGrids() {
  globalGrids.value = !globalGrids.value
  celestialBodies.value.forEach(body => toggleBodyGridHelper(body.id, globalGrids.value))
  orbits.value.forEach(orbit => toggleOrbitGridHelper(orbit.id, globalGrids.value))
}

/**
 * ~ Registers a new celestial body, creating its state object and helpers, and adds it to the global state
 * This is called by `useSceneLoader` during scene construction
 *
 * @param {string} id - The unique ID of the celestial body (e.g., "earth")
 * @param {string} name - The display name of the celestial body (e.g., "Earth")
 * @param {string} description - A description of the celestial body
 * @param {Mesh} mesh - The `THREE.Mesh` object for the body
 */
export function registerCelestialBody(id: string, name: string, description: string, mesh: Mesh) {
  // * Only register if a body with this ID doesn't already exist
  if (!_findBody(id)) {
    // * Safely compute the bounding sphere to get the radius for sizing the helpers
    if (!mesh.geometry.boundingSphere) {
      mesh.geometry.computeBoundingSphere()
    }
    const size = 1.5 * mesh.geometry.boundingSphere!.radius

    celestialBodies.value.push({
      id,
      name,
      description,
      mesh,
      isWireframe: false,
      hasAxesHelpers: false,
      hasGridHelpers: false,
      axesHelper: new AxesHelper(size),
      gridHelper: new GridHelper(size, 10),
    })
  }
}

/**
 * ~ Registers a new orbit, creating its state object and helpers, and adds it to the global state
 *
 * @param {string} id - The unique ID of the orbit (e.g., "earth_orbit")
 * @param {string} name - The display name of the orbit (e.g., "Earth Orbit")
 * @param {string} bodyId - The ID of the celestial body this orbit belongs to
 * @param {Object3D} pivot - The pivot `Object3D` of the orbit
 * @param {number} radius - The radius of the orbit, used for sizing the helpers
 * @param {number} inclination - The inclination of the orbit in degrees
 * @param {Line} [lineMesh] - The optional visual line mesh for the orbit path
 */
export function registerOrbit(
  id: string,
  name: string,
  bodyId: string,
  pivot: Object3D,
  radius: number,
  inclination: number,
  lineMesh?: Line,
) {
  if (!_findOrbit(id)) {
    const size = 1.5 * radius

    // * The orbitalHelperHost is an Object3D that is aligned with the orbit's inclination
    // * This ensures that the GridHelper for the orbit is correctly oriented
    const orbitalHelperHost = new Object3D()
    orbitalHelperHost.rotation.x = MathUtils.degToRad(inclination)
    pivot.add(orbitalHelperHost)

    orbits.value.push({
      id,
      name,
      bodyId,
      pivot,
      lineMesh,
      orbitalHelperHost,
      hasAxesHelpers: false,
      hasGridHelpers: false,
      axesHelper: new AxesHelper(size),
      gridHelper: new GridHelper(size, 10),
    })
  }
}

/**
 * ~ A composable that exposes all the public action functions for controlling visualizations
 *
 * @returns {object} An object containing all the toggle and registration functions
 */
export function useDebugActions() {
  return {
    toggleBodyWireframe,
    toggleBodyAxisHelper,
    toggleBodyGridHelper,
    toggleOrbitAxisHelper,
    toggleOrbitGridHelper,
    toggleGlobalWireframe,
    toggleGlobalAxes,
    toggleGlobalGrids,
    registerCelestialBody,
    registerOrbit,
  }
}
