// ~ --- Constants ---
export const kmPerAu = 149597870.7

// ~ --- Scale factors ---
export const scaleFactors = {
  celestialBodyKmPerUnit: 69911 / 15, // ? approx. 4660.73 km per 3JS unit

  // ? 1 AU = 100 3JS units
  // ? So, 1 3JS unit = 0.01 AU
  orbitalDistanceAuPerUnit: 0.004,

  // ? 100,000 km = 1 3JS unit (for satellites)
  localOrbitalDistanceKmPerUnit: 100000,
}

export const timeConfig = {
  initialScale: 100, // ? initial time scale
  simulationSpeed: 1, // ? simulation speed multiplier
}
