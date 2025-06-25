import type {
  CelestialBodyState,
  CelestialBodyUIState,
  OrbitState,
  OrbitUIState,
} from '@/types/solarSystem.types'
import { computed, ref } from 'vue'

// ~ --- Global Toggle State ---
export const globalWireframe = ref(false)
export const globalAxes = ref(false)
export const globalGrids = ref(false)

// ~ --- Raw State Arrays ---
export const celestialBodies = ref<CelestialBodyState[]>([])
export const orbits = ref<OrbitState[]>([])

// ~ --- Computed properties for the UI ---
export const celestialBodiesForUI = computed((): CelestialBodyUIState[] =>
  celestialBodies.value.map(body => ({
    id: body.id,
    name: body.name,
    isWireframe: body.isWireframe,
    hasAxesHelpers: body.hasAxesHelpers,
    hasGridHelpers: body.hasGridHelpers,
  })))

export const orbitsForUI = computed((): OrbitUIState[] =>
  orbits.value.map(orbit => ({
    id: orbit.id,
    name: orbit.name,
    hasAxesHelpers: orbit.hasAxesHelpers,
    hasGridHelpers: orbit.hasGridHelpers,
  })))
