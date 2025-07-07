/**
 * @module useCelestialBodyFactory
 * @description A factory module for creating 3JS meshes for celestial bodies like the Sun, planets, and satellites
 * It handles the creation of geometries, loading of textures, and configuration of materials,
 * including complex custom shaders for effects like Earth's day/night cycle
 */
import type { CelestialBody, Planet, Satellite, Sun } from '@/types/solarSystem.types'
import * as THREE from 'three'
import { ref } from 'vue'
import { colors } from '@/configs/colors.config'
import { scaleFactors } from '@/configs/scaling.config'

// ~ --- Module-level state ---

/**
 * @private
 * @type {ref<THREE.Mesh[]>}
 * A reactive array to store all created meshes. This is used by the `cleanup`
 * function to properly dispose of all geometries and materials to prevent memory leaks
 */
const createdMeshes = ref<THREE.Mesh[]>([])

/**
 * # A factory composable that provides functions to create various celestial bodies
 *
 * @returns {object} An object containing factory functions (`createSun`, `createPlanet`, `createMoon`)
 *                   and a `cleanup` function
 */
export function useCelestialBodyFactory() {
  /**
   * ~ Creates a basic sphere geometry for a celestial body, scaled according to the project's configuration.
   *
   * @param {number} radiusKm - The actual radius of the celestial body in kilometers
   * @param {number} segments - The number of segments for the sphere geometry. Higher values result in a smoother sphere
   * @param {string} [_planetName] - An optional name for debugging purposes
   * @returns {THREE.SphereGeometry} The configured and scaled sphere geometry
   */
  const createSphereGeometry = (radiusKm: number, segments: number, _planetName?: string) => {
    // * Convert the real-world radius in km to the scaled 3D units used in the scene
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
   * ~ Asynchronously loads a texture from a given path
   *
   * @param {string} path - The public path to the texture image file
   * @returns {Promise<THREE.Texture>} A promise that resolves with the loaded 3JS Texture object
   */
  const loadTexture = async (path: string): Promise<THREE.Texture> => {
    const textureLoader = new THREE.TextureLoader()
    return new Promise((resolve, reject) => {
      textureLoader.load(
        path,
        texture => resolve(texture),
        undefined, // ? onProgress callback (not used for now)
        error => reject(error),
      )
    })
  }

  /**
   * ~ A generic function to create a celestial body mesh with standard materials and textures
   * This is used as a base for planets and satellites
   *
   * @param {Sun | Planet | Satellite} body - The data object containing properties for the celestial body
   * @returns {Promise<THREE.Mesh>} A promise that resolves with the created 3JS Mesh object
   */
  const createCelestialBody = async (body: Sun | Planet | Satellite): Promise<THREE.Mesh> => {
    const radius = Number.parseFloat(body.physicalProps.meanRadius)
    const geometry = createSphereGeometry(radius, 64, body.name)
    // * Computing the bounding sphere is important for raycasting and camera calculations
    geometry.computeBoundingSphere()

    const materialProps: THREE.MeshStandardMaterialParameters = {}

    // * --- Texture Loading ---
    if (body.textures.main)
      materialProps.map = await loadTexture(body.textures.main) // ? base color map

    if (body.textures.normal)
      materialProps.normalMap = await loadTexture(body.textures.normal) // ? adds surface detail

    // * The specular map is used to create a roughness map, which controls how light reflects off the surface
    if (body.textures.specular) {
      if (body.name.toLowerCase() === 'earth') {
        // * Earth's specular map is special: it shows water as black (not shiny)
        // * We need to process it to create a proper roughness map where water is smooth (low roughness)
        const glossTexture = await loadTexture(body.textures.specular)
        const image = glossTexture.image

        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height

        const context = canvas.getContext('2d')
        if (context) {
          // * Process the texture pixel by pixel on a 2D canvas
          context.drawImage(image, 0, 0)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          const minRoughness = 128 // ? clamp water roughness to make reflections more diffuse
          for (let i = 0; i < data.length; i += 4) {
            // * Invert the green channel (Roughness = 1 - Gloss)
            const invertedGreen = 255 - data[i + 1]
            data[i + 1] = Math.max(invertedGreen, minRoughness)
            // * Create a monochrome map from the corrected channel
            data[i] = data[i + 2] = data[i + 1]
          }
          context.putImageData(imageData, 0, 0)
          // * Use the canvas as the new roughness map
          materialProps.roughnessMap = new THREE.CanvasTexture(canvas)
        }
      }
      else {
        // * For other bodies, use the specular map directly as a roughness map
        materialProps.roughnessMap = await loadTexture(body.textures.specular)
      }
    }

    // * The emissive map is used for parts of the body that emit their own light, like city lights at night
    if (body.textures.night) {
      materialProps.emissiveMap = await loadTexture(body.textures.night)
      materialProps.emissive = new THREE.Color(colors.white) // ? color of the emitted light
      materialProps.emissiveIntensity = 1.0
    }

    const material = new THREE.MeshStandardMaterial(materialProps)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = body.name
    // * Allow the body to cast and receive shadows
    mesh.castShadow = true
    mesh.receiveShadow = true
    // * Store the mesh for later cleanup
    createdMeshes.value.push(mesh)

    return mesh
  }

  /**
   * ~ Creates the Sun mesh
   * The Sun uses a `MeshBasicMaterial` because it should not be affected by scene lighting
   *
   * @param {Sun} sunData - The data object for the Sun
   * @returns {Promise<THREE.Mesh>} A promise that resolves with the created Sun mesh
   */
  const createSun = async (sunData: Sun): Promise<THREE.Mesh> => {
    const radius = Number.parseFloat(sunData.physicalProps.meanRadius)
    const geometry = createSphereGeometry(radius, 64, sunData.name)

    geometry.computeBoundingSphere()

    // * The Sun is a light source, so it uses a basic material that isn't lit by other objects
    const texture = await loadTexture(sunData.textures.main)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = sunData.name
    createdMeshes.value.push(mesh)

    return mesh
  }

  /**
   * ~ Creates a planet mesh
   * including special customizations for Earth (clouds, day/night shader)
   *
   * @param {Planet} planetData - The data object for the planet
   * @returns {Promise<THREE.Mesh>} A promise that resolves with the created planet mesh
   */
  const createPlanet = async (planetData: Planet): Promise<THREE.Mesh> => {
    const planetMesh = await createCelestialBody(planetData)

    const planetMaterial = planetMesh.material as THREE.MeshStandardMaterial

    // * --- Custom adjustments for specific planets ---

    if (planetData.name.toLowerCase() === 'earth') {
      planetMaterial.roughness = 1.0
      planetMaterial.metalness = 0.0
      planetMaterial.emissiveIntensity = 1.0

      // * Add a second, slightly larger sphere for the cloud layer
      if (planetData.textures.clouds) {
        const cloudTexture = await loadTexture(planetData.textures.clouds)
        const cloudGeometry = createSphereGeometry(
          Number.parseFloat(planetData.physicalProps.meanRadius) * 1.002, // ? slightly larger than Earth
          64,
        )
        const cloudMaterial = new THREE.MeshStandardMaterial({
          alphaMap: cloudTexture, // ? use the texture for transparency.
          transparent: true,
          opacity: 0.6,
        })
        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
        cloudMesh.name = 'EarthClouds'
        cloudMesh.castShadow = true // ? clouds should cast shadows on the planet. (maybe not)
        planetMesh.add(cloudMesh)
      }

      // * Use a custom GLSL shader to make the emissive map (city lights)
      // * only visible on the parts of the Earth that are in shadow
      planetMaterial.onBeforeCompile = (shader) => {
        // * Pass the sun's position to the shader as a uniform
        shader.uniforms.uLightPosition = { value: new THREE.Vector3(0, 0, 0) }

        // * Pass world-space position and normal from vertex to fragment shader
        shader.vertexShader
          = `varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n${
            shader.vertexShader}`
        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `
            #include <worldpos_vertex>
            vWorldPosition = worldPosition.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
          `,
        )

        // * Receive world-space values in fragment shader
        shader.fragmentShader
          = `uniform vec3 uLightPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n${
            shader.fragmentShader}`

        // * Append our custom logic to the end of the standard emissive map shader code
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <emissivemap_fragment>',
          `
            #include <emissivemap_fragment>

            // Calculate the direction of light from the sun to the current pixel
            vec3 lightDirection = normalize(uLightPosition - vWorldPosition);
            // Calculate the dot product to determine if the pixel is lit (day) or in shadow (night)
            float lightDot = dot(normalize(vWorldNormal), lightDirection);
            // Use smoothstep to create a soft transition between day and night
            float dayFactor = smoothstep(0.0, 0.15, lightDot);
            float nightFactor = 1.0 - dayFactor;

            // Apply the nightFactor to the city lights, so they fade out in daylight
            totalEmissiveRadiance *= nightFactor;
          `,
        )

        // * Store the shader so we can update its uniforms from the simulation manager
        planetMaterial.userData.shader = shader
      }
    }
    else {
      // * Default material properties for other planets
      planetMaterial.roughness = 0.8
      planetMaterial.metalness = 0.2
    }
    planetMaterial.needsUpdate = true

    return planetMesh
  }

  /**
   * ~ Creates a satellite mesh
   *
   * @param {Satellite} satelliteData - The data object for the satellite
   * @returns {Promise<THREE.Mesh>} A promise that resolves with the created satellite mesh
   */
  const createSatellite = async (satelliteData: Satellite): Promise<THREE.Mesh> => {
    const satelliteMesh = await createCelestialBody(satelliteData)
    // * Satellites are generally less reflective and non-metallic
    const satelliteMaterial = satelliteMesh.material as THREE.MeshStandardMaterial
    satelliteMaterial.roughness = 0.9
    satelliteMaterial.metalness = 0.1
    satelliteMaterial.needsUpdate = true
    return satelliteMesh
  }

  /**
   * ~ Disposes of all created geometries and materials to prevent memory leaks
   * This should be called when the scene is being dismantled
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
    createSatellite,
    cleanup,
  }
}
