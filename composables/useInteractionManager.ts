import type { Camera, WebGLRenderer } from 'three'
import { Raycaster, Vector2 } from 'three'
import { onMounted, onUnmounted } from 'vue'
import { hoveredBody, selectedBody } from '@/composables/interactionState'
import { useSolarSystemData } from '@/composables/useSolarSystemData'
import { celestialBodies } from '@/composables/visualisationState'

export function useInteractionManager(
  camera: Camera,
  renderer: WebGLRenderer,
) {
  const raycaster = new Raycaster()
  const mouse = new Vector2()
  const { data: solarSystemData } = useSolarSystemData()

  function onMouseMove(event: MouseEvent) {
    // * Mous coordinates normalization
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // * Raycasting
    raycaster.setFromCamera(mouse, camera)

    // * Intersection check
    const intersects = raycaster.intersectObjects(
      celestialBodies.value.map(body => body.mesh),
    )

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      const bodyState = celestialBodies.value.find(
        body => body.mesh === intersectedObject,
      )
      if (bodyState && hoveredBody.value?.id !== bodyState.id) {
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

  function onClick(event: MouseEvent) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(
      celestialBodies.value.map(body => body.mesh),
    )

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      const bodyState = celestialBodies.value.find(
        body => body.mesh === intersectedObject,
      )

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
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      selectedBody.value = null
    }
  }

  onMounted(() => {
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('click', onClick)
    window.addEventListener('keydown', onKeyDown)
  })

  onUnmounted(() => {
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.domElement.removeEventListener('click', onClick)
    window.removeEventListener('keydown', onKeyDown)
  })
}
