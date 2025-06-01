import type { StarfieldOptions } from '@/types/scene.types'
import * as THREE from 'three'
import { onUnmounted, ref } from 'vue'
import { starfieldConfig } from '@/configs/scene.config'

/**
 * ? Creates and manages a starfield in a Three.js scene
 * @param scene - The Three.js scene to add the starfield to
 * @param options - Configuration options for the starfield
 * @returns Object containing methods to control the starfield
 */

export function useStarfield(scene: THREE.Scene, options: StarfieldOptions) {
  const { count, size, minDistance, maxDistance, color } = options

  // * Geometry
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  // * Random stars scattering
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // position within a sphere
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = Math.cbrt(minDistance ** 3 + Math.random() * (maxDistance ** 3 - minDistance ** 3)) // cube root, better results

    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    // size variation
    sizes[i] = size * (Math.random() + 5)
  }

  // add positions and sizes to geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  // * Material
  const material = new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size,
    sizeAttenuation: true,
    transparent: true,
  })

  // * Starfield object
  const starfield = new THREE.Points(geometry, material)
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
