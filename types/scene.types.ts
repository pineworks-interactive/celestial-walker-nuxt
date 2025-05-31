import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface SceneManagerOptions {
  containerId: string
  fov?: number
  near?: number
  far?: number
}

export interface SceneManager {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  controls: OrbitControls
  isInitialized: boolean
  init: () => void
  dispose: () => void
  animate: () => void
}
