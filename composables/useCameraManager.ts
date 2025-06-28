import type { PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { gsap } from 'gsap'
import { MathUtils, Vector3 } from 'three'
import { readonly, ref } from 'vue'
import { outlinedObjects } from '@/composables/effectsState'
import { isCameraFollowing, isTacticalViewActive } from '@/composables/interactionState'
import { cameraInitialPosition } from '@/configs/scene.config'

const FOCAL_LENGTH_MULTIPLIER = 1.5
const TACTICAL_VIEW_HEIGHT = 3950

let focusAnimation: gsap.core.Tween | null = null
let tacticalAnimation: gsap.core.Tween | null = null

const cameraDistance = ref(0)

/**
 * # Manages camera movements like focusing on objects and resetting the view.
 * @param camera The Three.js PerspectiveCamera instance.
 * @param controls The OrbitControls instance.
 */
export function useCameraManager(camera: PerspectiveCamera, controls: OrbitControls) {
  const lastTargetPosition = new Vector3()

  // ? store camera state before entering tactical view
  const preTacticalCameraState = {
    position: new Vector3(),
    target: new Vector3(),
    wasFollowing: false,
  }

  const updateCameraDistance = () => {
    cameraDistance.value = camera.position.distanceTo(controls.target)
  }

  // ? set initial distance
  updateCameraDistance()

  /**
   * ~ Focus camera on a specific celestial body
   */
  const focusOnBody = (body: CelestialBodyState) => {
    const { mesh } = body
    if (!mesh)
      return

    if (focusAnimation)
      focusAnimation.kill()
    if (tacticalAnimation)
      tacticalAnimation.kill()

    isCameraFollowing.value = false
    isTacticalViewActive.value = false

    mesh.geometry.computeBoundingSphere()
    const sphere = mesh.geometry.boundingSphere
    if (!sphere) {
      console.error(`Could not compute bounding sphere for ${body.name}`)
      return
    }

    // ? store the starting positions for interpolation
    const startCamPos = camera.position.clone()
    const startTargetPos = controls.target.clone()

    // ? create a proxy object for GSAP to animate its 'progress' property
    const proxy = { progress: 0 }

    focusAnimation = gsap.to(proxy, {
      progress: 1, // ? animate progress (0 to 1)
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate() {
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

        // ? interpolate camera and target positions (easing)
        camera.position.copy(startCamPos).lerp(endCamPos, proxy.progress)
        controls.target.copy(startTargetPos).lerp(endTargetPos, proxy.progress)

        updateCameraDistance()
      },
      onComplete() {
        isCameraFollowing.value = true
        mesh.getWorldPosition(lastTargetPosition)
        outlinedObjects.value = []
        focusAnimation = null
        updateCameraDistance()
      },
    })
  }
  /**
   * ~ Enter tactical view mode
   */
  const enterTacticalView = () => {
    // ? kill existing animations
    if (focusAnimation)
      focusAnimation.kill()
    if (tacticalAnimation)
      tacticalAnimation.kill()

    // ? store current camera state
    preTacticalCameraState.position.copy(camera.position)
    preTacticalCameraState.target.copy(controls.target)
    preTacticalCameraState.wasFollowing = isCameraFollowing.value

    // ? reset following state
    isCameraFollowing.value = false

    const startCamPos = camera.position.clone()
    const startTargetPos = controls.target.clone()

    // ? target position (looking at origin)
    const endTargetPos = new Vector3(0, 0, 0)
    // ? camera position (high above, looking down)
    const endCamPos = new Vector3(0, TACTICAL_VIEW_HEIGHT, 0)

    const proxy = { progress: 0 }

    tacticalAnimation = gsap.to(proxy, {
      progress: 1,
      duration: 2.0,
      ease: 'power3.inOut',
      onUpdate() {
        camera.position.copy(startCamPos).lerp(endCamPos, proxy.progress)
        controls.target.copy(startTargetPos).lerp(endTargetPos, proxy.progress)
        updateCameraDistance()
      },
      onComplete() {
        isTacticalViewActive.value = true
        tacticalAnimation = null
        updateCameraDistance()
      },
    })
  }

  /**
   * ~ Exit tactical view mode
   * (return to previous camera state)
   */
  const exitTacticalView = () => {
    // ? kill existing animations
    if (tacticalAnimation)
      tacticalAnimation.kill()

    const startCamPos = camera.position.clone()
    const startTargetPos = controls.target.clone()

    // ? return to stored state or initial position
    const endCamPos = preTacticalCameraState.position.length() > 0
      ? preTacticalCameraState.position.clone()
      : new Vector3(cameraInitialPosition.x, cameraInitialPosition.y, cameraInitialPosition.z)

    const endTargetPos = preTacticalCameraState.target.length() > 0
      ? preTacticalCameraState.target.clone()
      : new Vector3(0, 0, 0)

    const proxy = { progress: 0 }

    tacticalAnimation = gsap.to(proxy, {
      progress: 1,
      duration: 2.0,
      ease: 'power3.inOut',
      onUpdate() {
        camera.position.copy(startCamPos).lerp(endCamPos, proxy.progress)
        controls.target.copy(startTargetPos).lerp(endTargetPos, proxy.progress)
        updateCameraDistance()
      },
      onComplete() {
        isTacticalViewActive.value = false
        // ? restore following state if it was active before
        if (preTacticalCameraState.wasFollowing) {
          isCameraFollowing.value = true
        }
        tacticalAnimation = null
        updateCameraDistance()
      },
    })
  }

  /**
   * ~ Toggle between tactical view and normal view
   */
  const toggleTacticalView = () => {
    if (isTacticalViewActive.value) {
      exitTacticalView()
    }
    else {
      enterTacticalView()
    }
  }

  /**
   * ~Reset camera to initial position
   */
  const resetCamera = () => {
    if (focusAnimation) {
      focusAnimation.kill()
      focusAnimation = null
    }
    if (tacticalAnimation) {
      tacticalAnimation.kill()
      tacticalAnimation = null
    }

    isCameraFollowing.value = false
    isTacticalViewActive.value = false
    controls.enabled = true

    gsap.to(camera.position, { ...cameraInitialPosition, duration: 1.5, ease: 'power3.inOut' })
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut' })
  }

  return {
    cameraDistance: readonly(cameraDistance),
    isFollowing: isCameraFollowing,
    isTacticalView: isTacticalViewActive,
    lastTargetPosition,
    focusOnBody,
    resetCamera,
    enterTacticalView,
    exitTacticalView,
    toggleTacticalView,
  }
}
