/**
 * @module useOrbitFactory
 * @description A factory module for creating the components related to orbital mechanics in the scene
 * It provides functions to create both the logical orbit pivot objects and their visual representations (orbit lines)
 */
import type { Line } from 'three'
import { BufferGeometry, LineBasicMaterial, Object3D } from 'three'
import * as THREE from 'three'
import { ref } from 'vue'
import { colors } from '@/configs/colors.config'
import { kmPerAu, scaleFactors } from '@/configs/scaling.config'

// ~ --- Module-level state ---
/**
 * @private
 * @type {ref<Line[]>}
 * A reactive array to store all created line meshes. This is used by the `cleanupLines`
 * function to properly dispose of all line geometries and materials to prevent memory leaks
 */
const createdLines = ref<Line[]>([])

/**
 * # A factory composable that provides functions to create orbits and their visual lines
 *
 * @returns {object} An object containing factory functions (`createOrbit`, `createOrbitLine`)
 *                   and a `cleanupLines` function
 */
export function useOrbitFactory() {
  /**
   * ~ Creates an `Object3D` that acts as a logical pivot point for an orbiting body
   * This pivot handles the orbital distance and inclination, while the actual rotation (position in orbit)
   * is handled by the simulation manager. The final effective radius is stored in `userData` for later use
   *
   * @param {number} centerToCenterDistanceKm - The astronomical distance from the center of the central body to the center of the orbiting body, in kilometers
   * @param {number} [centralBodyScaledRadius] - The scaled radius of the central body in 3D units. This is added as an offset to prevent the orbit line from being inside the central body
   * @param {number} [speed] - A placeholder for orbital speed (currently not used for position calculation, which is time-based)
   * @param {string} [orbitName] - A descriptive name for the orbit object
   * @returns {THREE.Object3D} An `Object3D` to be used as the orbital pivot
   */
  const createOrbit = (
    centerToCenterDistanceKm: number,
    centralBodyScaledRadius: number = 0, // ? default to 0 if no offset needed
    speed: number = 0.1,
    orbitName: string = '',
  ): THREE.Object3D => {
    const orbit = new THREE.Object3D()
    orbit.name = orbitName

    // * Convert the real-world astronomical distance into scaled 3D units
    const planetOrbitalRadiusAu = centerToCenterDistanceKm / kmPerAu
    const planetScaledOrbitalRadius = planetOrbitalRadiusAu / scaleFactors.orbitalDistanceAuPerUnit

    // * The final radius for the visual line is the scaled orbital distance plus the radius of the body being orbited
    // * This ensures the line appears outside the central body, not from its center
    const finalEffectiveScaledRadius = planetScaledOrbitalRadius + centralBodyScaledRadius

    // * Store calculated values and original data in userData for debugging and use by other systems
    orbit.userData = {
      orbitRadius: finalEffectiveScaledRadius, // ? final radius used for the visual line
      orbitSpeed: speed,
      // * store originals for debugging purposes
      planetAstronomicalOrbitalDistanceKm: centerToCenterDistanceKm,
      planetScaledOrbitalRadius, // ? scaled orbit radius before adding the central body's radius
      centralBodyScaledRadiusOffset: centralBodyScaledRadius, // ? offset amount
    }

    return orbit
  }

  /**
   * ~ Creates a visual `Line` mesh representing the path of an orbit
   *
   * @param {number} radius - The radius of the circular orbit in 3D units
   * @param {number} [resolution] - The number of segments used to draw the circle. Higher values result in a smoother line
   * @returns {THREE.Line} The created `Line` mesh
   */
  const createOrbitLine = (radius: number, resolution: number = 512): THREE.Line => {
    const points: number[] = []
    // * Create a circle by calculating points along its circumference
    for (let i = 0; i <= resolution; i++) {
      const angle = (i / resolution) * 2 * Math.PI
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      points.push(x, 0, z) // ? orbit is on the X-Z plane
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    const material = new THREE.LineBasicMaterial({
      color: colors.white,
      opacity: 0.2, // ? make the line semi-transparent
      transparent: true,
      linewidth: 2, // ! Note: this is not supported by all WebGL renderers (to test)
    })

    const line = new THREE.Line(geometry, material)

    // * Store the line for later cleanup
    createdLines.value.push(line)
    return line
  }

  /**
   * ~ Disposes of all created orbit line geometries and materials to prevent memory leaks
   */
  const cleanupLines = () => {
    createdLines.value.forEach((line) => {
      // * Safely dispose of geometry
      if (line.geometry && typeof line.geometry.dispose === 'function') {
        line.geometry.dispose()
      }

      // * Safely dispose of material(s), handling both single and multi-material objects
      if (line.material) {
        if (Array.isArray(line.material)) {
          line.material.forEach((material) => {
            if (material && typeof material.dispose === 'function') {
              material.dispose()
            }
          })
        }
        else if (typeof line.material.dispose === 'function') {
          line.material.dispose()
        }
      }
    })
    createdLines.value = []
  }

  return {
    createOrbit,
    createOrbitLine,
    cleanupLines,
  }
}
