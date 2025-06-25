import type { CelestialBody, Planet, Sun } from '@/types/solarSystem.types'
import * as THREE from 'three'
import { ref } from 'vue'
import { colors } from '@/configs/colors.config'
import { kmPerAu, scaleFactors } from '@/configs/scaling.config'

export function useCelestialBodyFactory() {
  // * Store created meshes (cleanup)
  const createdMeshes = ref<THREE.Mesh[]>([])

  /**
   * # Creates a basic sphere geometry for a celestial body
   * @param radius - Radius of the sphere in km
   * @param segments - Number of segments for the sphere
   */
  const createSphereGeometry = (radiusKm: number, segments: number, _planetName?: string) => {
    // * We need to convert km unit to 3JS units and apply a scale factor
    const scaledRadius = radiusKm / scaleFactors.celestialBodyKmPerUnit

    // // TEMPORARY: Make Earth larger for debugging
    // if (planetName && planetName.toLowerCase() === 'earth') {
    //   scaledRadius *= 1 // 1x bigger
    //   console.warn(`DEBUG --> : Earth's scaledRadius temporarily increased to: ${scaledRadius}`)
    // }
    // // TEMPORARY: Make Moon larger for debugging
    // if (planetName && planetName.toLowerCase() === 'moon') {
    //   scaledRadius *= 1 // 1x bigger
    //   console.warn(`DEBUG --> : Moon's scaledRadius temporarily increased to: ${scaledRadius}`)
    // }

    const geometry = new THREE.SphereGeometry(scaledRadius, segments, segments)
    return geometry
  }

  /**
   * # Loads a texture file from a given path
   * @param path - Path to the texture file
   */
  const loadTexture = async (path: string): Promise<THREE.Texture> => {
    const textureLoader = new THREE.TextureLoader()
    return new Promise((resolve, reject) => {
      textureLoader.load(
        path,
        texture => resolve(texture),
        undefined,
        error => reject(error),
      )
    })
  }

  /**
   * # Creates a basic material for a celestial body
   * @param texturePath - Path to the texture file
   */
  const createBasicMaterial = async (texturePath: string): Promise<THREE.MeshStandardMaterial> => {
    const texture = await loadTexture(texturePath)
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1.0,
      metalness: 0.0,
    })
  }

  /**
   * # Creates a celestial body mesh from geometry and material
   * @param body - Celestial body data
   */
  const createCelestialBody = async (body: CelestialBody): Promise<THREE.Mesh> => {
    const radius = Number.parseFloat(body.physicalProps.meanRadius)
    const geometry = createSphereGeometry(radius, 32, body.name)
    const material = await createBasicMaterial(body.textures.main)

    const mesh = new THREE.Mesh(geometry, material)
    createdMeshes.value.push(mesh)

    return mesh
  }

  /**
   * # Creates the Sun with basic properties
   * @param sunData - Sun data from solar_system_data.json
   */
  const createSun = async (sunData: Sun): Promise<THREE.Mesh> => {
    const sunMesh = await createCelestialBody(sunData)

    // * Adding basic sun properties
    const sunMaterial = sunMesh.material as THREE.MeshStandardMaterial
    sunMaterial.emissive = new THREE.Color(colors.yellow)
    sunMaterial.emissiveIntensity = 0.5

    return sunMesh
  }

  /**
   * # Creates a planet with basic properties
   * @param planetData - Planet data from solar_system_data.json
   */
  const createPlanet = async (planetData: Planet): Promise<THREE.Mesh> => {
    const planetMesh = await createCelestialBody(planetData)

    // * Adding basic planet properties
    const planetMaterial = planetMesh.material as THREE.MeshStandardMaterial
    planetMaterial.roughness = 0.8
    planetMaterial.metalness = 0.2
    // // TEMPORARY: Make Earth emissive for debugging
    // if (planetData.name.toLowerCase() === 'earth') {
    //   planetMaterial.emissive = new THREE.Color(colors.blue) // Bright blue for Earth
    //   planetMaterial.emissiveIntensity = 2.0 // Make it quite bright
    //   planetMaterial.needsUpdate = true // Ensure material update
    // }
    // //TEMPORARY: Make the Moon emissive for debugging
    // if (planetData.name.toLowerCase() === 'moon') {
    //   planetMaterial.emissive = new THREE.Color(colors.white) // Bright blue for Earth
    //   planetMaterial.emissiveIntensity = 2.0 // Make it quite bright
    //   planetMaterial.needsUpdate = true // Ensure material update
    // }

    return planetMesh
  }

  /**
   * # Creates a simple circular orbit
   * @param centerToCenterDistanceKm - Orbital distance from center of central body to center of orbiting body in km
   * @param centralBodyScaledRadius - Scaled radius of the central body in 3JS units
   * @param speed - Orbit speed in degrees per frame
   */
  const createOrbit = (
    centerToCenterDistanceKm: number,
    centralBodyScaledRadius: number = 0, // default to 0 if no offset needed
    speed: number = 0.1,
  ): THREE.Object3D => {
    const orbit = new THREE.Object3D()

    // * Scale the planet's astronomical orbital distance (center-to-center)
    const planetOrbitalRadiusAu = centerToCenterDistanceKm / kmPerAu
    const planetScaledOrbitalRadius = planetOrbitalRadiusAu / scaleFactors.orbitalDistanceAuPerUnit

    // * Planet's own scaled orbital distance + scaled radius of the central body's mesh.
    const finalEffectiveScaledRadius = planetScaledOrbitalRadius + centralBodyScaledRadius

    orbit.userData = {
      orbitRadius: finalEffectiveScaledRadius,
      orbitSpeed: speed,
      // store originals for debugging purposes
      planetAstronomicalOrbitalDistanceKm: centerToCenterDistanceKm,
      planetScaledOrbitalRadius, // scaled orbit before offset
      centralBodyScaledRadiusOffset: centralBodyScaledRadius, // added offset
    }
    console.warn(`DEBUG --> Creating orbit:
      Planet Astro Dist (km): ${centerToCenterDistanceKm}, 
      Planet Scaled Orbit Radius (3JS units): ${planetScaledOrbitalRadius.toFixed(2)}, 
      Central Body Scaled Radius Offset (3JS units): ${centralBodyScaledRadius.toFixed(2)}, 
      Final Effective Scaled Radius (3JS units): ${finalEffectiveScaledRadius.toFixed(2)}`,
    )

    return orbit
  }

  /**
   * # Updates the position of a celestial body in its orbit
   * @param pivot - The celestial body's parent pivot to update
   * @param time - The current simulation time
   * @param orbitalPeriodDays - The orbital period in Earth days
   * @param semiMajorAxis - The semi-major axis (orbital radius)
   */
  const updateOrbit = (
    pivot: THREE.Object3D,
    time: number,
    orbitalPeriodDays: number,
    semiMajorAxis: number,
  ): void => {
    const bodyToOrbit = pivot.children[0]
    if (!bodyToOrbit)
      return

    // ? Calculate the orbital speed based on the period
    const angularSpeed = (2 * Math.PI) / orbitalPeriodDays
    const angle = time * angularSpeed

    // ? Calculate the position of the child body, not the pivot
    bodyToOrbit.position.x = Math.cos(angle) * semiMajorAxis
    bodyToOrbit.position.z = Math.sin(angle) * semiMajorAxis
  }

  /**
   * # Cleanup function to dispose of created meshes and materials
   */
  const cleanup = (): void => {
    createdMeshes.value.forEach((mesh) => {
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose())
      }
      else {
        mesh.material.dispose()
      }
    })
    createdMeshes.value = []
  }

  return {
    createSun,
    createPlanet,
    createOrbit,
    updateOrbit,
    cleanup,
  }
}
