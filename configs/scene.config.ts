import { colors } from './colors.config'

export const cameraConfigDefault = {
  fov: 75,
  near: 0.1,
  far: 1000,
}

export const cameraInitialPosition = {
  x: 0,
  y: 0,
  z: 10,
}

export const rendererConfig = {
  antialias: true,
}

export const rendererProps = {
  backgroundColor: colors.black,
}

export const sceneConfig = {
  fov: 75,
  near: 0.1,
  far: 5000,
  containerId: 'canvas',
}

export const controlsConfig = {
  enableDamping: true,
  dampingFactor: 0.05,
  screenSpacePanning: true,
  minDistance: 0.1,
  maxDistance: 1000,
  maxPolarAngle: Math.PI / 2,
}

export const ambientLightConfig = {
  color: colors.white,
  intensity: 0.5,
}

export const starfieldConfig = {
  count: 3000,
  size: 5,
  minDistance: 4000,
  maxDistance: 4999,
  color: colors.white,
}
