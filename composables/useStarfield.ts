import type { Scene } from 'three'
import type { StarfieldOptions } from '@/types/scene.types'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three'
import { onUnmounted } from 'vue'
import { colors } from '@/configs/colors.config'

/**
 * # Creates and manages a starfield in a Three.js scene
 * @param scene - The Three.js scene to add the starfield to
 * @param options - Configuration options for the starfield
 * @returns Object containing methods to control the starfield
 */

export function useStarfield(scene: Scene, options: StarfieldOptions) {
  const { count, size, minDistance, maxDistance } = options

  // * Geometry
  const geometry = new BufferGeometry()
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  // * Random stars scattering
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // ? position within a sphere
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = Math.cbrt(minDistance ** 3 + Math.random() * (maxDistance ** 3 - minDistance ** 3)) // cube root, better results

    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    // ? size variation
    sizes[i] = size * (Math.random() + 5)
  }

  // * Add stars position and size to geometry
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('size', new BufferAttribute(sizes, 1))

  // * Material
  const material = new PointsMaterial({
    color: colors.white,
    size,
    sizeAttenuation: true,
    transparent: true,
  })

  // * Starfield object
  const starfield = new Points(geometry, material)
  scene.add(starfield)

  // * Cleanup function
  const cleanup = () => {
    geometry.dispose()
    material.dispose()
    scene.remove(starfield)
  }

  // * Lifecycle hook
  onUnmounted(cleanup)

  return {
    starfield,
    cleanup,
  }
}
