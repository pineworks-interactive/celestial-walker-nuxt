/**
 * @module useSceneLoader
 * @description This module is responsible for orchestrating the creation of the entire solar system scene.
 * It fetches the necessary data and then uses various factories to build the sun, planets, satellites,
 * and their respective orbits, assembling them into the correct hierarchical structure.
 */
import type { Object3D, Scene } from 'three'
import type { Planet, Satellite, SolarSystemData, Sun } from '@/types/solarSystem.types'
import * as THREE from 'three'

import { useSolarSystemData } from '@/composables/data/useSolarSystemData'
import { useCelestialBodyFactory } from '@/composables/factories/useCelestialBodyFactory'
import { useOrbitFactory } from '@/composables/factories/useOrbitFactory'
import { useDebugActions } from '@/composables/features/useVisualisation'
import { useCoordinateConversion } from '@/composables/utils/useCoordinateConversion'
import { scaleFactors } from '@/configs/scaling.config'

/**
 * # Provides a `load` function to asynchronously build the entire scene
 *
 * @returns {object} An object containing the `load` function
 */
export function useSceneLoader() {
  const { data: solarSystemData, loadData: loadSolarSystemData } = useSolarSystemData()
  const { createSun, createPlanet, createSatellite } = useCelestialBodyFactory()
  const { createOrbit, createOrbitLine } = useOrbitFactory()
  const { registerCelestialBody, registerOrbit } = useDebugActions()

  /**
   * ~ Loads all necessary data and then constructs the solar system within the provided scene
   *
   * @param {Scene} scene - The main 3JS scene to add the solar system objects to
   */
  async function load(scene: Scene) {
    try {
      await loadSolarSystemData()
      if (solarSystemData.value) {
        await _createSolarSystem(solarSystemData.value, scene)
        console.warn('%c[SCENELOADER] Solar system created.', 'color: green; font-weight: bold;')
      }
    }
    catch (error) {
      console.error('Error loading scene data:', error)
    }
  }

  /**
   * ~ Creates the sun and all planets from the loaded solar system data
   *
   * @private
   * @param {SolarSystemData} solarSystemData - The complete dataset for the solar system.
   * @param {Object3D} scene - The parent object (usually the main scene) to which the sun and planets will be added.
   */
  async function _createSolarSystem(solarSystemData: SolarSystemData, scene: Object3D) {
    const sunMesh = await _createSun(solarSystemData.sun, scene)

    // * Add a point light at the center of the sun to illuminate the scene
    const pointLight = new THREE.PointLight(0xFFFFFF, 250000, 0, 2)
    pointLight.castShadow = true // ? the sun's light should cast shadows
    pointLight.shadow.bias = -0.005 // ? adjust shadow bias to prevent "shadow acne" artifacts
    pointLight.position.set(0, 0, 0)
    sunMesh.add(pointLight)

    if (!sunMesh.geometry.boundingSphere) {
      sunMesh.geometry.computeBoundingSphere()
    }
    // * Get the Sun's radius to use as an offset for planetary orbits
    const sunRadius = sunMesh.geometry.boundingSphere!.radius

    // * Iterate through all planets and create them
    for (const planetData of Object.values(solarSystemData.planets)) {
      await _createPlanet(planetData, scene, sunRadius)
    }
  }

  /**
   * ~ Creates a satellite, its orbit, and attaches it to its parent planet's system
   *
   * @private
   * @param {Satellite} satelliteData - The data for the satellite
   * @param {THREE.Object3D} parentSystem - The `Object3D` container of the parent planet's system
   * @param {number} parentRadius - The scaled radius of the parent planet, used to offset the moon's orbit
   */
  async function _createSatellite(satelliteData: Satellite, parentSystem: THREE.Object3D, parentRadius: number) {
    const satelliteMesh = await createSatellite(satelliteData)
    satelliteMesh.name = satelliteData.name
    satelliteMesh.userData = {
      id: satelliteData.id,
      type: 'celestial-body',
    }
    registerCelestialBody(satelliteData.id, satelliteData.name, satelliteData.description, satelliteMesh)

    // * --- Orbit Creation ---
    const orbitalDistance = Number.parseFloat(satelliteData.orbitalProps.semiMajorAxis)
    const orbitalInclination = Number.parseFloat(satelliteData.orbitalProps.orbitalInclination)
    const longAscendingNode = Number.parseFloat(satelliteData.orbitalProps.longAscendingNode)

    // * 1. Create the orbital plane, which handles the longitude of the ascending node (rotation around the Y-axis)
    const orbitalPlane = new THREE.Object3D()
    orbitalPlane.name = `${satelliteData.name} Orbital Plane`
    orbitalPlane.rotation.y = THREE.MathUtils.degToRad(longAscendingNode)

    // * 2. Create the orbit pivot, which handles the inclination (rotation around the X-axis)
    const orbitPivot = createOrbit(
      orbitalDistance,
      parentRadius, // ? use parent's radius to offset the orbit from its surface
      1, // ? placeholder speed
      `${satelliteData.name} Orbit`,
    )
    orbitPivot.rotation.x = THREE.MathUtils.degToRad(orbitalInclination)

    // * 3. Create the visual line for the orbit path
    const orbitRadiusForLine = orbitPivot.userData.orbitRadius
    const orbitLine = createOrbitLine(orbitRadiusForLine)
    orbitLine.name = `${satelliteData.name} Orbit Line`
    orbitLine.userData = { id: `${satelliteData.id}_orbit` } // ? add ID for raycaster interaction

    // * 4. Assemble the hierarchy: moon -> pivot -> plane -> parent system
    orbitPivot.add(satelliteMesh)
    orbitPivot.add(orbitLine)
    orbitalPlane.add(orbitPivot)
    parentSystem.add(orbitalPlane) // ? add the moon's entire system to the parent's system group

    // * 5. Register the orbit for debugging tools
    registerOrbit(
      `${satelliteData.id}_orbit`,
      `${satelliteData.name} Orbit`,
      satelliteData.id,
      orbitPivot,
      orbitRadiusForLine,
      orbitalInclination,
      orbitLine,
    )
  }

  /**
   * ~ Creates a planet, its orbit, its satellites, and adds them to the scene
   *
   * @private
   * @param {Planet} planetData - The data for the planet.
   * @param {Object3D} scene - The main scene object.
   * @param {number} sunRadius - The scaled radius of the sun, used for offsetting the planet's orbit.
   */
  async function _createPlanet(planetData: Planet, scene: Object3D, sunRadius: number) {
    const planetMesh = await createPlanet(planetData)
    planetMesh.name = planetData.name
    planetMesh.userData = {
      id: planetData.id,
      type: 'celestial-body',
    }
    registerCelestialBody(planetData.id, planetData.name, planetData.description, planetMesh)

    // * --- Orbit Creation ---
    // * 1. Convert orbital elements from the solar system's invariable plane to the Sun's equatorial plane for accurate visualization
    const sunAxialTilt = Number.parseFloat(solarSystemData.value!.sun.physicalProps.axialTilt)
    const originalElements = {
      orbitalInclination: Number.parseFloat(planetData.orbitalProps.orbitalInclination),
      longAscendingNode: Number.parseFloat(planetData.orbitalProps.longAscendingNode),
    }
    const converted = useCoordinateConversion(originalElements, sunAxialTilt)

    const orbitData = {
      distance: Number.parseFloat(planetData.orbitalProps.semiMajorAxis),
      speed: 1,
      orbitalInclination: converted.newOrbitalInclination,
      longAscendingNode: converted.newLongAscendingNode,
    }

    // * 2. Create the orbital plane for longitude of ascending node
    const orbitalPlane = new THREE.Object3D()
    orbitalPlane.name = `${planetData.name} Orbital Plane`
    orbitalPlane.rotation.y = THREE.MathUtils.degToRad(orbitData.longAscendingNode)

    // * 3. Create the orbit pivot for inclination
    const orbit = createOrbit(orbitData.distance, sunRadius, orbitData.speed, `${planetData.name} Orbit`)
    orbit.rotation.x = THREE.MathUtils.degToRad(orbitData.orbitalInclination)

    // * 4. Create the visual orbit line
    const orbitRadius = orbit.userData.orbitRadius
    const orbitLine = createOrbitLine(orbitRadius)
    orbitLine.name = `${planetData.name} Orbit Line`
    orbitLine.userData = { id: `${planetData.id}_orbit` } // ? add ID for raycaster interaction

    // * 5. Assemble the hierarchy. This is a crucial step for interaction handling.
    // * We create a "system" container so that the planet mesh and its satellites are siblings.
    // * This prevents outlining the parent from also outlining all its children.
    const planetSystem = new THREE.Object3D()
    planetSystem.name = `${planetData.name} System`
    planetSystem.add(planetMesh)

    orbit.add(planetSystem) // ? the planet's system is child of the orbit pivot
    orbit.add(orbitLine) // ? the orbit line is a sibling of the planet's system
    orbitalPlane.add(orbit) // ? the pivot is a child of the plane
    scene.add(orbitalPlane) // ? the plane is a child of the main scene

    // * 6. Register the orbit for debugging tools
    registerOrbit(
      `${planetData.id}_orbit`,
      `${planetData.name} Orbit`,
      planetData.id,
      orbit,
      orbitRadius,
      orbitData.orbitalInclination,
      orbitLine,
    )

    // * 7. Create satellites for this planet, if any
    if (planetData.satellites) {
      if (!planetMesh.geometry.boundingSphere) {
        planetMesh.geometry.computeBoundingSphere()
      }
      const planetRadius = planetMesh.geometry.boundingSphere!.radius
      // * Pass the `planetSystem` container as the parent for satellites
      for (const satelliteData of Object.values(planetData.satellites)) {
        await _createSatellite(satelliteData, planetSystem, planetRadius)
      }
    }
  }

  /**
   * ~ Creates the sun mesh and registers it for debugging
   *
   * @private
   * @param {Sun} sunData - The data for the Sun.
   * @param {Object3D} parentScene - The main scene object.
   * @returns {Promise<THREE.Mesh>} A promise resolving to the created sun mesh.
   */
  async function _createSun(sunData: Sun, parentScene: Object3D) {
    const sunMesh = await createSun(sunData)
    sunMesh.name = sunData.name
    sunMesh.userData = {
      id: sunData.id,
      type: 'celestial-body',
    }
    parentScene.add(sunMesh)
    registerCelestialBody(sunData.id, sunData.name, sunData.description, sunMesh)
    return sunMesh
  }

  return {
    load,
  }
}
