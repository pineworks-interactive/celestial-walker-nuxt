import type { Camera, Object3D, Scene, WebGLRenderer } from 'three'
import { Raycaster, Vector2 } from 'three'
import { hoveredBody, selectedBody } from '@/composables/interactionState'
import { useSolarSystemData } from '@/composables/useSolarSystemData'
import { celestialBodies } from '@/composables/visualisationState'

export function useInteractionManager(
  scene: Scene,
  camera: Camera,
  renderer: WebGLRenderer,
) {
  const raycaster = new Raycaster()
  const mouse = new Vector2(-2, -2) // ? initialize off-screen
  const { data: solarSystemData } = useSolarSystemData()

  function findBodyByIntersect(intersectedObject: Object3D) {
    if (!intersectedObject)
      return null

    // ? identify a 3JS object by its UUID
    return celestialBodies.value.find(
      body => body.mesh.uuid === intersectedObject.uuid,
    )
  }

  function onMouseMove(event: MouseEvent) {
    const canvasBounds = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1
    mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1
  }

  function checkHoverIntersection() {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(
      celestialBodies.value.map(body => body.mesh),
      true,
    )

    const bodyState = findBodyByIntersect(intersects[0]?.object)

    if (bodyState) {
      if (hoveredBody.value?.id !== bodyState.id) {
        hoveredBody.value = {
          id: bodyState.id,
          name: bodyState.name,
        }
      }
    }
    else {
      if (hoveredBody.value) {
        hoveredBody.value = null
      }
    }
  }

  function onClick() {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    const bodyState = findBodyByIntersect(intersects[0]?.object)

    if (bodyState && solarSystemData.value) {
      const { sun, planets } = solarSystemData.value
      let bodyData = null

      if (sun.id === bodyState.id) {
        bodyData = { ...sun, mesh: bodyState.mesh }
      }
      else {
        for (const planetKey in planets) {
          const planet = planets[planetKey]
          if (planet.id === bodyState.id) {
            bodyData = { ...planet, mesh: bodyState.mesh }
            break
          }
          for (const moonKey in planet.moons) {
            const moon = planet.moons[moonKey]
            if (moon.id === bodyState.id) {
              bodyData = { ...moon, mesh: bodyState.mesh }
              break
            }
          }
          if (bodyData)
            break
        }
      }

      if (bodyData) {
        selectedBody.value = bodyData
      }
    }
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
