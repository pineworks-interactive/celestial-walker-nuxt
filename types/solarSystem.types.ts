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
  moons: Moon[]
}

export interface Moon extends CelestialBody {}

export interface Planet extends CelestialBody {}

export interface Sun extends CelestialBody {}

// Main solar system data structure
export interface SolarSystemData {
  sun: Sun
  planets: { [key: string]: Planet }
}
