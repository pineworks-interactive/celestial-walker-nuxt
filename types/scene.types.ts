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
  renderer: WebGLRenderer | null
  controls: OrbitControls | null
  isSceneBaseInit: Ref<boolean>
  isSceneContentsInit: Ref<boolean>
  init: () => void
  dispose: () => void
}

export interface StarfieldOptions {
  count: number
  size: number
  minDistance: number
  maxDistance: number
  color: number
}
