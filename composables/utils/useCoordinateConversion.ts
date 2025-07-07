/**
 * @module useCoordinateConversion
 * @description This utility module provides a function to convert orbital elements from one
 * reference plane to another. This is essential for accurately representing planetary orbits,
 * which are often defined relative to the ecliptic plane, in a 3D scene where the reference
 * might be the Sun's equatorial plane.
 */
import { MathUtils } from 'three'

/**
 * @interface OrbitalElements
 * @description Defines the orbital elements required for the coordinate conversion.
 */
interface OrbitalElements {
  /**
   * Inclination of the orbit in degrees, relative to the original reference plane (e.g., the ecliptic).
   */
  orbitalInclination: number
  /**
   * Longitude of the ascending node in degrees, relative to the original reference plane.
   * This defines the direction of the point where the orbit crosses the reference plane going upwards.
   */
  longAscendingNode: number
}

/**
 * @interface ConvertedOrbitalElements
 * @description Contains the new orbital elements after the conversion.
 */
interface ConvertedOrbitalElements {
  /**
   * The new inclination in degrees, relative to the new reference plane (e.g., the Sun's equator).
   */
  newOrbitalInclination: number
  /**
   * The new longitude of the ascending node in degrees, relative to the new reference plane.
   */
  newLongAscendingNode: number
}

/**
 * ~ Converts orbital elements from an original reference plane (like the ecliptic)
 * to a new reference plane (like the Sun's equatorial plane)
 * This calculation is based on the law of cosines for spherical triangles, a fundamental
 * concept in celestial mechanics for changing reference frames
 *
 * @param {OrbitalElements} elements - The original orbital elements (inclination, longitude of ascending node)
 * @param {number} newPlaneInclination - The inclination of the new reference plane with respect to the old one (e.g., the Sun's axial tilt)
 * @returns {ConvertedOrbitalElements} The converted orbital elements relative to the new plane
 */
export function useCoordinateConversion(
  elements: OrbitalElements,
  newPlaneInclination: number,
): ConvertedOrbitalElements {
  // * Convert all input angles from degrees to radians, as required by JavaScript's Math functions
  const iOld = MathUtils.degToRad(elements.orbitalInclination)
  const longOld = MathUtils.degToRad(elements.longAscendingNode)
  const iNewPlane = MathUtils.degToRad(newPlaneInclination)

  // * Use the Law of Cosines for spherical triangles to find the new inclination (iNew)
  const cosINew = Math.cos(iOld) * Math.cos(iNewPlane) + Math.sin(iOld) * Math.sin(iNewPlane) * Math.cos(longOld)
  const iNew = Math.acos(cosINew)

  // * Use the Law of Sines/Cosines (specifically, the four-part cotangent formula rearranged) to find the new longitude of the ascending node
  // * Using `atan2` is crucial here as it provides a result in the correct quadrant (0-360 degrees), avoiding ambiguity
  const y = Math.sin(longOld) * Math.sin(iOld)
  const x = Math.sin(iNewPlane) * Math.cos(iOld) - Math.cos(iNewPlane) * Math.sin(iOld) * Math.cos(longOld)
  const longNew = Math.atan2(y, x)

  // * Convert the results from radians back to degrees before returning
  return {
    newOrbitalInclination: MathUtils.radToDeg(iNew),
    newLongAscendingNode: MathUtils.radToDeg(longNew),
  }
}
