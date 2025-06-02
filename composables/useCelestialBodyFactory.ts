import type { CelestialBody, Planet, Sun } from '@/types/solarSystem.types'
import * as THREE from 'three'
import { ref } from 'vue'
import { colors } from '@/configs/colors.config'

export function useCelestialBodyFactory() {
  // * Store created meshes (cleanup)
  const createdMeshes = ref<THREE.Mesh[]>([])

  /**
   * ? Creates a basic sphere geometry for a celestial body
   * @param radius - Radius of the sphere in km
   * @param segments - Number of segments for the sphere
   */
  const createSphereGeometry = (radius: number, segments: number, planetName?: string) => {
    // * We need to convert km unit to 3JS units and apply a scale factor
    let scaledRadius = radius / 1000

    // TEMPORARY: Make Earth much larger for debugging
    if (planetName && planetName.toLowerCase() === 'earth') {
      scaledRadius *= 500 // 500x bigger
      console.warn(`DEBUG: Earth's scaledRadius temporarily increased to: ${scaledRadius}`)
    }

    const geometry = new THREE.SphereGeometry(scaledRadius, segments, segments)
    return geometry
  }

  /**
   * ? Loads a texture file from a given path
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
   * ? Creates a basic material for a celestial body
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
   * ? Creates a celestial body mesh from geometry and material
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
   * ?Creates the Sun with basic properties
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
   * ? Creates a planet with basic properties
   * @param planetData - Planet data from solar_system_data.json
   */
  const createPlanet = async (planetData: Planet): Promise<THREE.Mesh> => {
    const planetMesh = await createCelestialBody(planetData)

    // * Adding basic planet properties
    const planetMaterial = planetMesh.material as THREE.MeshStandardMaterial
    planetMaterial.roughness = 0.8
    planetMaterial.metalness = 0.2
    // TEMPORARY: Make Earth emissive for debugging
    if (planetData.name.toLowerCase() === 'earth') {
      planetMaterial.emissive = new THREE.Color(colors.blue) // Bright blue for Earth
      planetMaterial.emissiveIntensity = 2.0 // Make it quite bright
      planetMaterial.needsUpdate = true // Ensure material update
    }

    return planetMesh
  }

  /**
   * ?Creates a simple circular orbit
   * @param radius - Orbit radius in km
   * @param speed - Orbit speed in degrees per frame
   */
  const createOrbit = (radius: number, speed: number = 0.1): THREE.Object3D => {
    const orbit = new THREE.Object3D()
    orbit.userData = {
      orbitRadius: radius / 1000,
      orbitSpeed: speed,
    }

    return orbit
  }

  /**
   * ? Updates the position of a celestial body in its orbit
   * @param body - The celestial body mesh
   * @param orbit - The orbit object
   */
  const updateOrbit = (body: THREE.Mesh, orbit: THREE.Object3D): void => {
    const { orbitRadius, orbitSpeed } = orbit.userData
    const time = Date.now() * 0.001 // convert to seconds

    body.position.x = Math.cos(time * orbitSpeed) * orbitRadius
    body.position.z = Math.sin(time * orbitSpeed) * orbitRadius
  }

  /**
   * ? Cleanup function to dispose of created meshes and materials
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
