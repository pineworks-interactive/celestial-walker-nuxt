/**
 * @module visualisationState
 * @description This module defines the global reactive state for debug visualizations.
 * It holds the raw state for all celestial bodies and orbits, as well as computed
 * properties that are formatted for consumption by UI components.
 */
import type {
  CelestialBodyState,
  CelestialBodyUIState,
  OrbitState,
  OrbitUIState,
} from '@/types/solarSystem.types'
import { computed, ref } from 'vue'

// ~ --- Global Toggle State ---

// * A global flag to control the wireframe view for all celestial bodies
export const globalWireframe = ref(false)
// * A global flag to control the visibility of `AxesHelper` for all objects
export const globalAxes = ref(false)
// * A global flag to control the visibility of `GridHelper` for all objects
export const globalGrids = ref(false)

// ~ --- Raw State Arrays ---

/**
 * The raw array of `CelestialBodyState` objects. Each object contains the full state
 * for a celestial body, including its `THREE.Mesh`, helper objects, and boolean flags.
 * This is populated by `useSceneLoader` via the `registerCelestialBody` function.
 */
export const celestialBodies = ref<CelestialBodyState[]>([])
/**
 * The raw array of `OrbitState` objects. Each object contains the full state
 * for an orbit, including its pivot, line mesh, helpers, and boolean flags.
 * This is populated by `useSceneLoader` via the `registerOrbit` function.
 */
export const orbits = ref<OrbitState[]>([])

// ~ --- Computed properties for the UI ---

/**
 * A computed property that transforms the raw `celestialBodies` array into a
 * simplified format (`CelestialBodyUIState`) suitable for UI components.
 * This decouples the UI from the complex internal state of the 3D objects.
 */
export const celestialBodiesForUI = computed((): CelestialBodyUIState[] =>
  celestialBodies.value.map(body => ({
    id: body.id,
    name: body.name,
    description: body.description,
    isWireframe: body.isWireframe,
    hasAxesHelpers: body.hasAxesHelpers,
    hasGridHelpers: body.hasGridHelpers,
  })))

/**
 * A computed property that transforms the raw `orbits` array into a
 * simplified format (`OrbitUIState`) suitable for UI components.
 */
export const orbitsForUI = computed((): OrbitUIState[] =>
  orbits.value.map(orbit => ({
    id: orbit.id,
    name: orbit.name,
    hasAxesHelpers: orbit.hasAxesHelpers,
    hasGridHelpers: orbit.hasGridHelpers,
  })))
