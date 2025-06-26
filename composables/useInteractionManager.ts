import type { Camera, Object3D, Scene, WebGLRenderer } from 'three'
import type { Ref } from 'vue'
import type { CelestialBodyState } from '@/types/solarSystem.types'
import { Raycaster, Vector2 } from 'three'
import { watch } from 'vue'
import {
  HOVER_COLOR,
  outlineColor,
  outlinedObjects,
  SELECT_COLOR,
} from '@/composables/effectsState'
import { hoveredBody, selectedBody } from '@/composables/interactionState'

export function useInteractionManager(
  scene: Scene,
  camera: Camera,
  renderer: WebGLRenderer,
  celestialBodies: Ref<CelestialBodyState[]>,
) {
  const raycaster = new Raycaster()
  const mouse = new Vector2(-2, -2) // ? initialize off-screen

  function manageOutlineEffects() {
    watch([hoveredBody, selectedBody], ([newHovered, newSelected]) => {
      // //console.log(`[2/3 EFFECT_WATCHER] Fired. Hovered: ${newHovered?.name || 'none'}. Selected: ${newSelected?.name || 'none'}.`)
      const objectsToOutline: Object3D[] = []

      // ? 1: A selected body gets a green outline.
      if (newSelected?.mesh) {
        objectsToOutline.push(newSelected.mesh)
        outlineColor.value = SELECT_COLOR
      }
      // ? 2: A hovered body gets a white outline if nothing is selected.
      else if (newHovered?.mesh) {
        objectsToOutline.push(newHovered.mesh)
        outlineColor.value = HOVER_COLOR
      }

      // //console.log(`[2/3 EFFECT_WATCHER] Decision: Outlining [${objectsToOutline.map(o => o.name).join(', ')}]`)
      // ? Update the global state that the OutlinePass watches.
      outlinedObjects.value = objectsToOutline
    })
  }

  function findBodyByIntersect(intersectedObject: Object3D) {
    if (!intersectedObject?.userData?.id)
      return null

    // ? identify a 3JS object by its UUID
    return celestialBodies.value.find(
      body => body.id === intersectedObject.userData.id,
    )
  }

  function onMouseMove(event: MouseEvent) {
    const canvasBounds = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1
    mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1
  }

  function checkHoverIntersection() {
    raycaster.setFromCamera(mouse, camera)
    // ? need to filter out starfield as it seem to jam raycasting
    const interactiveObjects = scene.children.filter(child => child.name !== 'starfield')
    const intersects = raycaster.intersectObjects(interactiveObjects, true)

    let bodyState = null
    for (const intersect of intersects) {
      const foundBody = findBodyByIntersect(intersect.object)
      if (foundBody) {
        bodyState = foundBody
        break // ? found body, stop searching
      }
    }

    if (bodyState) {
      if (hoveredBody.value?.id !== bodyState.id) {
        // //console.log(`[1/3 INTERACTION] Hover detected. Setting hoveredBody to: ${bodyState.name}`)
        hoveredBody.value = bodyState
      }
    }
    else {
      if (hoveredBody.value) {
        // //console.log('[1/3 INTERACTION] Hover lost. Setting hoveredBody to: null')
        hoveredBody.value = null
      }
    }
  }

  function onClick() {
    raycaster.setFromCamera(mouse, camera)
    // ? need to filter out starfield as it seem to jam raycasting
    const interactiveObjects = scene.children.filter(child => child.name !== 'starfield')
    const intersects = raycaster.intersectObjects(interactiveObjects, true)

    let bodyState = null
    for (const intersect of intersects) {
      const foundBody = findBodyByIntersect(intersect.object)
      if (foundBody) {
        bodyState = foundBody
        break
      }
    }

    selectedBody.value = bodyState
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      selectedBody.value = null
    }
  }

  const init = () => {
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('click', onClick)
    window.addEventListener('keydown', onKeyDown)
    manageOutlineEffects()
  }

  const dispose = () => {
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.domElement.removeEventListener('click', onClick)
    window.removeEventListener('keydown', onKeyDown)
  }

  return {
    init,
    dispose,
    checkHoverIntersection,
  }
}
