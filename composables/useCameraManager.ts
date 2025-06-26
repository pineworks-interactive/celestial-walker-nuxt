import type { PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { gsap } from 'gsap'
import { Vector3 } from 'three'
import { cameraInitialPosition } from '@/configs/scene.config'

/**
 * # Manages camera movements like focusing on objects and resetting the view.
 * @param camera The 3JS PerspectiveCamera instance
 * @param controls The OrbitControls instance
 */
export function useCameraManager(camera: PerspectiveCamera, controls: OrbitControls) {
  /**
   * ~ Smoothly animates the camera to focus on a celestial body
   * @param body The celestial body to focus on
   */
  const focusOnBody = (body: CelestialBodyState) => {
    const { mesh } = body
    if (!mesh)
      return

    mesh.geometry.computeBoundingSphere()
    const sphere = mesh.geometry.boundingSphere
    if (!sphere)
      return

    const targetPosition = new Vector3()
    mesh.getWorldPosition(targetPosition)

    // Position camera to fit the object in view
    const distance = sphere.radius * 3
    const cameraPosition = new Vector3(
      targetPosition.x,
      targetPosition.y + distance / 2, // A bit above for a better angle
      targetPosition.z + distance,
    )

    gsap.to(camera.position, {
      ...cameraPosition,
      duration: 1.5,
      ease: 'power3.inOut',
    })

    gsap.to(controls.target, {
      ...targetPosition,
      duration: 1.5,
      ease: 'power3.inOut',
    })
  }

  /**
   * ~ Resets the camera to its initial position and target
   */
  const resetCamera = () => {
    gsap.to(camera.position, {
      x: cameraInitialPosition.x,
      y: cameraInitialPosition.y,
      z: cameraInitialPosition.z,
      duration: 1.5,
      ease: 'power3.inOut',
    })

    gsap.to(controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: 'power3.inOut',
    })
  }

  return {
    focusOnBody,
    resetCamera,
  }
}
