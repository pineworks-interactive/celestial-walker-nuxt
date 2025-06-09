import type { Mesh } from 'three'
import type { CelestialBodyState, CelestialBodyUIState } from '@/types/solarSystem.types'
import { computed, readonly, ref } from 'vue'

const globalWireframe = ref(false)
const celestialBodies = ref<CelestialBodyState[]>([]) // internal state with mesh

/**
 * # Composable for managing debug controls state for celestial bodies.
 * @returns An object with state and functions to modify it.
 */
export function useDebugControls() {
  /**
   * ? Toggles the global wireframe mode for all celestial bodies.
   */
  const toggleGlobalWireframe = () => {
    globalWireframe.value = !globalWireframe.value
    celestialBodies.value.forEach((body) => {
      body.isWireframe = globalWireframe.value
      // eslint-disable-next-line ts/no-use-before-define
      updateMeshWireframe(body.mesh, globalWireframe.value)
    })
  }

  /**
   * ? Toggles wireframe mode for a specific celestial body.
   * @param id - The unique identifier of the celestial body
   */
  const toggleBodyWireframe = (id: string) => {
    const body = celestialBodies.value.find(body => body.id === id)
    if (body) {
      body.isWireframe = !body.isWireframe
      // eslint-disable-next-line ts/no-use-before-define
      updateMeshWireframe(body.mesh, body.isWireframe)
    }
  }

  /**
   * ? Toggles axis helper for a specific celestial body.
   * @param id - The unique identifier of the celestial body
   */
  const toggleBodyAxisHelper = (id: string) => {
    const body = celestialBodies.value.find(body => body.id === id)
    if (body) {
      body.hasAxesHelpers = !body.hasAxesHelpers
      // TODO: Implement logic to add/remove axis helper from the scene
    }
  }

  /**
   * ? Toggles grid helper for a specific celestial body.
   * @param id - The unique identifier of the celestial body
   */
  const toggleBodyGridHelper = (id: string) => {
    const body = celestialBodies.value.find(body => body.id === id)
    if (body) {
      body.hasGridHelpers = !body.hasGridHelpers
      // TODO: Implement logic to add/remove grid helper from the scene
    }
  }

  /**
   * ? A computed property that exposes a UI-safe version of the celestial bodies state.
   */
  const celestialBodiesForUI = computed((): CelestialBodyUIState[] => {
    return celestialBodies.value.map(body => ({
      id: body.id,
      name: body.name,
      isWireframe: body.isWireframe,
      hasAxesHelpers: body.hasAxesHelpers,
      hasGridHelpers: body.hasGridHelpers,
    }))
  })

  /**
   * ? Registers a new celestial body for debug controls.
   * @param id - Unique identifier for the body
   * @param name - Display name of the body
   * @param mesh - The 3JS mesh of the body
   */
  const registerCelestialBody = (id: string, name: string, mesh: Mesh) => {
    celestialBodies.value.push({
      id,
      name,
      mesh,
      isWireframe: globalWireframe.value,
      hasAxesHelpers: false,
      hasGridHelpers: false,
    })
  }

  /**
   * ? Updates the wireframe property of a mesh and its materials.
   * @param mesh - The 3JS mesh to update
   * @param isWireframe - Whether wireframe should be enabled
   */
  const updateMeshWireframe = (mesh: Mesh, isWireframe: boolean) => {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => {
        if ('wireframe' in material) {
          material.wireframe = isWireframe
        }
      })
    }
    else if ('wireframe' in mesh.material) {
      mesh.material.wireframe = isWireframe
    }
  }

  return {
    globalWireframe: readonly(globalWireframe),
    celestialBodies: celestialBodiesForUI,
    toggleGlobalWireframe,
    toggleBodyWireframe,
    toggleBodyAxisHelper,
    toggleBodyGridHelper,
    registerCelestialBody,
  }
}
