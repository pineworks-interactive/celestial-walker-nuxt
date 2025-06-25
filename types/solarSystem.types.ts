import type { AxesHelper, GridHelper, Line, Mesh, Object3D } from 'three'

export interface CelestialTextures {
  main: string
  day?: string
  night?: string
  clouds?: string
  rings?: string
  atmosphere?: string
  specular?: string
  normal?: string
}

export interface PhysicalProperties {
  meanRadius: string
  meanRadiusUnit: string
  polarRadius: string
  polarRadiusUnit: string
  axialTilt: string
  axialTiltUnit: string
  rotationPeriod: string
  rotationPeriodUnit: string
  mass: string
  massUnit: string
  density: string
  densityUnit: string
  surfaceGravity: string
  surfaceGravityUnit: string
  rings: string[]
}

export interface OrbitalProperties {
  semiMajorAxis: string
  semiMajorAxisUnit: string
  eccentricity: string
  eccentricityUnit: string
  inclination: string
  inclinationUnit: string
  orbitalPeriod: string
  orbitalPeriodUnit: string
  longAscendingNode: string
  longAscendingNodeUnit: string
  argOfPerihelion: string
  argOfPerihelionUnit: string
  meanAnomaly: string
  meanAnomalyUnit: string
}

// Base interface for all celestial bodies
export interface CelestialBody {
  id: string
  name: string
  description: string
  textures: CelestialTextures
  physicalProps: PhysicalProperties
  orbitalProps: OrbitalProperties
  moons: { [key: string]: Moon }
  mesh?: Mesh
}

export interface Moon extends CelestialBody {}

export interface Planet extends CelestialBody {}

export interface Sun extends CelestialBody {}

// Main solar system data structure
export interface SolarSystemData {
  sun: Sun
  planets: { [key: string]: Planet }
}

export interface CelestialBodyState {
  id: string
  name: string
  mesh: Mesh
  isWireframe: boolean
  hasAxesHelpers: boolean
  hasGridHelpers: boolean
  axesHelper?: AxesHelper
  gridHelper?: GridHelper
}

export interface OrbitState {
  id: string
  name: string
  pivot: Object3D
  orbitalHelperHost: Object3D
  hasAxesHelpers: boolean
  hasGridHelpers: boolean
  axesHelper?: AxesHelper
  gridHelper?: GridHelper
}

// UI-specific type
export type CelestialBodyUIState = Omit<CelestialBodyState, 'mesh' | 'axesHelper' | 'gridHelper'>
export type OrbitUIState = Omit<OrbitState, 'pivot' | 'axesHelper' | 'gridHelper' | 'orbitalHelperHost'>
