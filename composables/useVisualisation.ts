import type { Mesh } from 'three'
import { AxesHelper, GridHelper, Material, MathUtils, Object3D } from 'three'
import {
  celestialBodies,
  globalAxes,
  globalGrids,
  globalWireframe,
  orbits,
} from '@/composables/visualisationState'

// ~ --- Private Helper Functions ---

function _log(message: string, data?: any) {
  // eslint-disable-next-line no-console
  console.log(`[DebugActions] ${message}`, data || '')
}

const _findBody = (id: string) => celestialBodies.value.find(body => body.id === id)
const _findOrbit = (id: string) => orbits.value.find(orbit => orbit.id === id)

/**
 * # Toggles the visibility of a 3JS helper.
 * ! private utility function
 * @param helper - The AxesHelper/GridHelper to toggle
 * @param shouldBeVisible - The desired visibility state
 * @param parent - The parent Object3D to add/remove the helper from
 */
function _toggleHelperVisibility(helper: AxesHelper | GridHelper | undefined, shouldBeVisible: boolean, parent: Object3D) {
  if (shouldBeVisible) {
    if (helper) {
      if (helper.material instanceof Material) {
        helper.material.depthTest = false
        // ? ensure material is recompiled if needed
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

// ~ --- Public Action Functions ---

/**
 * # Toggles the wireframe property for a specific celestial body.
 * @param id - The ID of the celestial body
 */
export function toggleBodyWireframe(id: string) {
  _log(`toggleBodyWireframe called with id: ${id}`)
  const body = _findBody(id)
  if (body) {
    const material = body.mesh.material
    if (material) {
      body.isWireframe = !body.isWireframe
      if (Array.isArray(material)) {
        material.forEach((m) => {
          // ? check if the material supports wireframe
          if ('wireframe' in m) {
            (m as { wireframe: boolean }).wireframe = body.isWireframe
          }
        })
      }
      else {
        // ? check if the material supports wireframe
        if ('wireframe' in material) {
          (material as { wireframe: boolean }).wireframe = body.isWireframe
        }
      }
    }
  }
}

/**
 * # Toggles the AxesHelper for a specific celestial body.
 * @param id - The ID of the celestial body
 * @param forced - A specific boolean state to force
 */
export function toggleBodyAxisHelper(id: string, forced?: boolean) {
  _log(`toggleBodyAxisHelper called with id: ${id} (forced: ${forced})`)
  const body = _findBody(id)
  if (body) {
    body.hasAxesHelpers = forced ?? !body.hasAxesHelpers
    _toggleHelperVisibility(body.axesHelper, body.hasAxesHelpers, body.mesh)
    _log(`> Toggling axes helper for ${body.name} to ${body.hasAxesHelpers}`)
  }
}

/**
 * # Toggles the GridHelper for a specific celestial body.
 * @param id - The ID of the celestial body
 * @param forced - A specific boolean state to force
 */
export function toggleBodyGridHelper(id: string, forced?: boolean) {
  _log(`toggleBodyGridHelper called with id: ${id} (forced: ${forced})`)
  const body = _findBody(id)
  if (body) {
    body.hasGridHelpers = forced ?? !body.hasGridHelpers
    _toggleHelperVisibility(body.gridHelper, body.hasGridHelpers, body.mesh)
    _log(`> Toggling grid helper for ${body.name} to ${body.hasGridHelpers}`)
  }
}

/**
 * # Toggles the AxesHelper for a specific orbit.
 * @param id - The ID of the orbit
 * @param forced - A specific boolean state to force
 */
export function toggleOrbitAxisHelper(id: string, forced?: boolean) {
  _log(`toggleOrbitAxisHelper called with id: ${id} (forced: ${forced})`)
  const orbit = _findOrbit(id)
  if (orbit) {
    orbit.hasAxesHelpers = forced ?? !orbit.hasAxesHelpers
    _toggleHelperVisibility(orbit.axesHelper, orbit.hasAxesHelpers, orbit.orbitalHelperHost)
    _log(`> Toggling axes helper for ${orbit.name} to ${orbit.hasAxesHelpers}`)
  }
}

/**
 * # Toggles the GridHelper for a specific orbit.
 * @param id - The ID of the orbit
 * @param forced - A specific boolean state to force
 */
export function toggleOrbitGridHelper(id: string, forced?: boolean) {
  _log(`toggleOrbitGridHelper called with id: ${id} (forced: ${forced})`)
  const orbit = _findOrbit(id)
  if (orbit) {
    orbit.hasGridHelpers = forced ?? !orbit.hasGridHelpers
    _toggleHelperVisibility(orbit.gridHelper, orbit.hasGridHelpers, orbit.orbitalHelperHost)
    _log(`> Toggling grid helper for ${orbit.name} to ${orbit.hasGridHelpers}`)
  }
}

/**
 * # Toggles the global wireframe state for all celestial bodies.
 */
export function toggleGlobalWireframe() {
  _log('toggleGlobalWireframe called')
  globalWireframe.value = !globalWireframe.value
  celestialBodies.value.forEach(body => (toggleBodyWireframe(body.id)))
  _log(`> Global wireframe toggled to ${globalWireframe.value}`)
}

/**
 * # Toggles the global AxesHelper state for all bodies and orbits.
 */
export function toggleGlobalAxes() {
  _log('toggleGlobalAxes called')
  globalAxes.value = !globalAxes.value
  celestialBodies.value.forEach(body => toggleBodyAxisHelper(body.id, globalAxes.value))
  orbits.value.forEach(orbit => toggleOrbitAxisHelper(orbit.id, globalAxes.value))
  _log(`> Global axes toggled to ${globalAxes.value}`)
}

/**
 * # Toggles the global GridHelper state for all bodies and orbits.
 */
export function toggleGlobalGrids() {
  _log('toggleGlobalGrids called')
  globalGrids.value = !globalGrids.value
  celestialBodies.value.forEach(body => toggleBodyGridHelper(body.id, globalGrids.value))
  orbits.value.forEach(orbit => toggleOrbitGridHelper(orbit.id, globalGrids.value))
  _log(`> Global grids toggled to ${globalGrids.value}`)
}

/**
 * # Registers a celestial body for debugging.
 * @param id - The ID of the body
 * @param name - The name of the body
 * @param mesh - The mesh of the body
 */
export function registerCelestialBody(id: string, name: string, mesh: Mesh) {
  _log(`Attempting to register celestial body: ${name} (id: ${id})`)
  // console.warn(`%c[REGISTERING] %c${name}`, 'color: blue; font-weight: bold;', 'color: default;', {
  //   name: mesh.name,
  //   uuid: mesh.uuid,
  //   userData: JSON.parse(JSON.stringify(mesh.userData)),
  // })
  if (!_findBody(id)) {
    // ? safely compute the bounding sphere to get the radius for the helpers
    if (!mesh.geometry.boundingSphere) {
      mesh.geometry.computeBoundingSphere()
    }
    const size = 1.5 * mesh.geometry.boundingSphere!.radius

    celestialBodies.value.push({
      id,
      name,
      mesh,
      isWireframe: false,
      hasAxesHelpers: false,
      hasGridHelpers: false,
      axesHelper: new AxesHelper(size),
      gridHelper: new GridHelper(size, 10),
    })
    _log(`> Successfully registered ${name}. Total bodies: ${celestialBodies.value.length}`)
  }
}

/**
 * # Registers an orbit for debugging.
 * @param id - The ID of the orbit
 * @param name - The name of the orbit
 * @param pivot - The pivot object of the orbit
 * @param radius - The radius of the orbit for sizing helpers
 * @param inclination - The inclination of the orbit in degrees
 */
export function registerOrbit(id: string, name: string, pivot: Object3D, radius: number, inclination: number) {
  _log(`Attempting to register orbit: ${name} (id: ${id})`)
  if (!_findOrbit(id)) {
    const size = 1.5 * radius

    const orbitalHelperHost = new Object3D()
    // ? apply orbital inclination
    orbitalHelperHost.rotation.x = MathUtils.degToRad(inclination)
    pivot.add(orbitalHelperHost)

    orbits.value.push({
      id,
      name,
      pivot,
      orbitalHelperHost,
      hasAxesHelpers: false,
      hasGridHelpers: false,
      axesHelper: new AxesHelper(size),
      gridHelper: new GridHelper(size, 10),
    })
    _log(`> Successfully registered ${name}. Total orbits: ${orbits.value.length}`)
  }
}

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
