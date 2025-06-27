import type { PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { gsap } from 'gsap'
import { MathUtils, Vector3 } from 'three'
import { ref } from 'vue'
import { outlinedObjects } from '@/composables/effectsState'
import { cameraInitialPosition } from '@/configs/scene.config'

const FOCAL_LENGTH_MULTIPLIER = 1.5
let focusAnimation: gsap.core.Tween | null = null

/**
 * Manages camera movements like focusing on objects and resetting the view.
 * @param camera The Three.js PerspectiveCamera instance.
 * @param controls The OrbitControls instance.
 */
export function useCameraManager(camera: PerspectiveCamera, controls: OrbitControls) {
  const isFollowing = ref(false)
  const lastTargetPosition = new Vector3()

  const focusOnBody = (body: CelestialBodyState) => {
    const { mesh } = body
    if (!mesh)
      return

    if (focusAnimation)
      focusAnimation.kill()

    isFollowing.value = false

    mesh.geometry.computeBoundingSphere()
    const sphere = mesh.geometry.boundingSphere
    if (!sphere) {
      console.error(`Could not compute bounding sphere for ${body.name}`)
      return
    }

    // Store the starting positions for interpolation.
    const startCamPos = camera.position.clone()
    const startTargetPos = controls.target.clone()

    // Create a proxy object for GSAP to animate its 'progress' property.
    const proxy = { progress: 0 }

    focusAnimation = gsap.to(proxy, {
      progress: 1, // Animate progress from 0 to 1.
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate() {
        // On every frame, calculate the dynamic end-points.
        const endTargetPos = new Vector3()
        mesh.getWorldPosition(endTargetPos)

        const fovInRadians = MathUtils.degToRad(camera.fov)
        const distanceToFit = sphere.radius / Math.tan(fovInRadians / 2)
        const finalDistance = distanceToFit * FOCAL_LENGTH_MULTIPLIER

        const endCamPos = new Vector3(
          endTargetPos.x,
          endTargetPos.y + finalDistance / 2,
          endTargetPos.z + finalDistance,
        )

        // Interpolate camera and target positions based on the eased progress.
        camera.position.copy(startCamPos).lerp(endCamPos, proxy.progress)
        controls.target.copy(startTargetPos).lerp(endTargetPos, proxy.progress)
      },
      onComplete() {
        isFollowing.value = true
        mesh.getWorldPosition(lastTargetPosition)
        outlinedObjects.value = []
        focusAnimation = null
      },
    })
  }

  const resetCamera = () => {
    if (focusAnimation) {
      focusAnimation.kill()
      focusAnimation = null
    }

    isFollowing.value = false
    controls.enabled = true

    gsap.to(camera.position, { ...cameraInitialPosition, duration: 1.5, ease: 'power3.inOut' })
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut' })
  }

  return {
    isFollowing,
    lastTargetPosition,
    focusOnBody,
    resetCamera,
  }
}
