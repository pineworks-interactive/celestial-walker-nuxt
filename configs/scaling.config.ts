export const kmPerAu = 149597870.7 // Kilometers in one Astronomical Unit

export const scaleFactors = {
  celestialBodyKmPerUnit: 69911 / 15, // Approx. 4660.73 km per 3JS unit

  // 1 AU = 100 3JS units
  // So, 1 3JS unit = 0.01 AU
  orbitalDistanceAuPerUnit: 0.01,
}

export const timeConfig = {
  initialScale: 100, // Initial time scale
}
