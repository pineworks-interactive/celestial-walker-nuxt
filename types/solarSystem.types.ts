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
  axialTilt: string
  axialTiltUnit: string
  mass: string
  massUnit: string
  density: string
  densityUnit: string
  lengthOfDay: string
  lengthOfDayUnit: string
  rotationPeriod: string
  rotationPeriodUnit: string
  surfaceGravity: string
  surfaceGravityUnit: string
  escapeVelocity: string
  escapeVelocityUnit: string
  surfaceMinTemperature: string
  surfaceMidTemperature: string
  surfaceMaxTemperature: string
  surfaceTemperatureUnit: string
  distanceFromSun: string
  distanceFromSunUnit: string
  rings: string[]
}

export interface OrbitalProperties {
  aphelion: string
  aphelionUnit: string
  perihelion: string
  perihelionUnit: string
  semiMajorAxis: string
  semiMajorAxisUnit: string
  orbitalEccentricity: string
  orbitalEccentricityUnit: string
  orbitalInclination: string
  orbitalInclinationUnit: string
  orbitalPeriod: string
  orbitalPeriodUnit: string
  orbitalVelocity: string
  orbitalVelocityUnit: string
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
  satellites?: { [key: string]: Satellite }
  mesh?: Mesh
}

export type Satellite = Omit<CelestialBody, 'physicalProps' | 'orbitalProps' | 'satellites'> & {
  physicalProps: Omit<PhysicalProperties, 'distanceFromSun' | 'distanceFromSunUnit'> & {
    distanceFromPrimary: string
    distanceFromPrimaryUnit: string
  }
  orbitalProps: Omit<OrbitalProperties, 'argOfPerihelion' | 'argOfPerihelionUnit'> & {
    argOfPerigee: string
    argOfPerigeeUnit: string
  }
}

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
  description: string
  isWireframe: boolean
  hasAxesHelpers: boolean
  hasGridHelpers: boolean
  axesHelper?: AxesHelper
  gridHelper?: GridHelper
}

export interface OrbitState {
  id: string
  name: string
  bodyId: string
  pivot: Object3D
  lineMesh?: Line
  orbitalHelperHost: Object3D
  hasAxesHelpers: boolean
  hasGridHelpers: boolean
  axesHelper?: AxesHelper
  gridHelper?: GridHelper
}

// UI-specific type
export type CelestialBodyUIState = Omit<CelestialBodyState, 'mesh' | 'axesHelper' | 'gridHelper'>
export type OrbitUIState = Omit<OrbitState, 'bodyId' | 'pivot' | 'lineMesh' | 'axesHelper' | 'gridHelper' | 'orbitalHelperHost'>
