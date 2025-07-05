/**
 * @module useStarfield
 * @description This module provides a composable function to create a beautiful,
 * procedural starfield for the background of a 3JS scene. It generates a large
 * number of particles (`Points`) and distributes them within a spherical volume to
 * create a convincing illusion of distant stars.
 *
 * @see https://threejs.org/docs/#examples/en/postprocessing/EffectComposer
 */
import type { Scene } from 'three'
import type { StarfieldOptions } from '@/types/scene.types'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three'
import { onUnmounted } from 'vue'
import { colors } from '@/configs/colors.config'

/**
 * # Creates and manages a starfield in a 3JS scene
 *
 * @param {Scene} scene - The 3JS scene to which the starfield will be added
 * @param {StarfieldOptions} options - Configuration options for the starfield, including `count`, `size`, `minDistance`, and `maxDistance`
 * @returns {object} An object containing the created `starfield` Points object and a `cleanup` function
 */
export function useStarfield(scene: Scene, options: StarfieldOptions) {
  const { count, size, minDistance, maxDistance } = options

  // * --- Geometry and Attributes ---
  const geometry = new BufferGeometry()
  // * Float32Arrays are memory-efficient arrays for storing vertex data
  const positions = new Float32Array(count * 3) // ? 3 because each position is a Vector3 (x, y, z)
  const sizes = new Float32Array(count)

  // * --- Star Generation Loop ---
  // * Procedurally generate the position and size for each star
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // * Use spherical coordinates (theta, phi, radius) to distribute points evenly within a sphere
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    // * Using the cube root of a random number provides a more uniform distribution within the sphere's volume
    const r = Math.cbrt(minDistance ** 3 + Math.random() * (maxDistance ** 3 - minDistance ** 3))

    // * Convert spherical coordinates back to Cartesian (x, y, z) coordinates
    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    // * Assign a random size variation to each star for a more natural look
    sizes[i] = size * (Math.random() + 5)
  }

  // * Add the position and size data to the geometry as attributes
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('size', new BufferAttribute(sizes, 1))

  // * --- Material ---
  // * `PointsMaterial` is specifically designed for rendering particles
  const material = new PointsMaterial({
    color: colors.white,
    size,
    sizeAttenuation: true, // ? This makes points appear smaller the further they are from the camera
    transparent: true,
  })

  // * --- Starfield Object ---
  const starfield = new Points(geometry, material)
  starfield.name = 'starfield' // ? name the object for easy identification in the scene graph and for raycasting filters
  scene.add(starfield)

  /**
   * ~ Cleans up the starfield's geometry and material to prevent memory leaks
   */
  const cleanup = () => {
    geometry.dispose()
    material.dispose()
    scene.remove(starfield)
  }

  // * Automatically call the cleanup function when the component using this composable is unmounted
  onUnmounted(cleanup)

  return {
    starfield,
    cleanup,
  }
}
