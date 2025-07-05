/**
 * @module useInteractionManager
 * @description This module centralizes all user interaction logic for the scene. It uses a `Raycaster`
 * to detect when the mouse is hovering over or clicking on celestial bodies and their orbits.
 * It manages the reactive state for hovered and selected objects and is responsible for triggering
 * visual feedback, such as highlighting orbit lines and managing which objects should be outlined.
 */
import type { Camera, Line, LineBasicMaterial, Object3D, Scene, WebGLRenderer } from 'three'
import type { Ref } from 'vue'
import type { CelestialBodyState, OrbitState } from '@/types/solarSystem.types'
import { Raycaster, Vector2 } from 'three'
import { watch } from 'vue'
import { colors } from '@/configs/colors.config'
import {
  HOVER_COLOR,
  outlineColor,
  outlinedObjects,
  SELECT_COLOR,
} from '~/composables/state/effectsState'
import { hoveredBody, isCameraFollowing, selectedBody } from '~/composables/state/interactionState'
import { orbits } from '~/composables/state/visualisationState'

/**
 * # Manages user interactions within the 3JS scene.
 *
 * @param {Scene} scene - The main 3JS scene
 * @param {Camera} camera - The main 3JS camera
 * @param {WebGLRenderer} renderer - The 3JS renderer, used to get canvas dimensions
 * @param {Ref<CelestialBodyState[]>} celestialBodies - A reactive reference to the array of celestial body states
 * @returns {object} An object with `init` and `dispose` methods for event listeners, and `checkHoverIntersection` to be called in the animation loop
 */
export function useInteractionManager(
  scene: Scene,
  camera: Camera,
  renderer: WebGLRenderer,
  celestialBodies: Ref<CelestialBodyState[]>,
) {
  const raycaster = new Raycaster()
  const mouse = new Vector2(-2, -2) // ? initialize mouse coordinates off-screen to avoid accidental intersections on load

  // * Increase the raycaster's sensitivity for lines to make them easier to click
  raycaster.params.Line.threshold = 2

  /**
   * @private
   * @type {Map<Line, { color: string, opacity: number }>}
   * A map to store the original material properties of orbit lines before they are highlighted.
   * This allows us to restore them to their original state later.
   */
  const originalLineMaterials = new Map<Line, { color: string, opacity: number }>()

  /**
   * ~ Watches for changes in hovered, selected, and focus states to apply or remove visual effects like outlines
   * This function acts as the central hub for visual feedback logic
   */
  function manageOutlineEffects() {
    watch([hoveredBody, selectedBody, isCameraFollowing], ([newHovered, newSelected, isFocusMode]) => {
      const objectsToOutline: string[] = []

      // * Always reset line materials to their default state before applying new highlights
      resetAllLineMaterials()

      // * If the camera is actively following a body (i.e., focus mode is complete),
      // * we don't show any outlines, as the focus itself is the main visual indicator
      if (isFocusMode) {
        outlinedObjects.value = []
        return
      }

      // * --- Outline Logic ---
      // * A selected body always takes priority for outlining
      if (newSelected?.mesh) {
        objectsToOutline.push(newSelected.mesh.name)
        outlineColor.value = SELECT_COLOR // ? springGreen for selected

        // * Also highlight the corresponding orbit line
        const associatedOrbit = findOrbitByBodyId(newSelected.id)
        if (associatedOrbit?.lineMesh) {
          highlightLine(associatedOrbit.lineMesh, SELECT_COLOR.getHexString())
        }
      }
      // * If nothing is selected, a hovered body gets an outline
      else if (newHovered?.mesh) {
        objectsToOutline.push(newHovered.mesh.name)
        outlineColor.value = HOVER_COLOR // ? white for hovered

        // * Also highlight the corresponding orbit line
        const associatedOrbit = findOrbitByBodyId(newHovered.id)
        if (associatedOrbit?.lineMesh) {
          highlightLine(associatedOrbit.lineMesh, HOVER_COLOR.getHexString())
        }
      }

      // * Update the global state that the OutlinePass in usePostProcessing is watching
      outlinedObjects.value = objectsToOutline
    })
  }

  /**
   * ~ Applies a highlight effect to a given orbit line
   *
   * @param {Line} line - The line mesh to highlight
   * @param {string} colorHex - The hexadecimal color string to apply
   */
  function highlightLine(line: Line, colorHex: string) {
    const material = line.material as LineBasicMaterial

    // * If we haven't stored this line's original properties yet, do so now
    if (!originalLineMaterials.has(line)) {
      originalLineMaterials.set(line, {
        color: `#${material.color.getHexString()}`,
        opacity: material.opacity,
      })
    }

    // * Apply the new highlight color and opacity
    material.color.setHex(Number.parseInt(colorHex, 16))
    material.opacity = 0.8
    material.needsUpdate = true
  }

  /**
   * ~ Resets all highlighted orbit lines back to their original material properties
   */
  function resetAllLineMaterials() {
    originalLineMaterials.forEach((originalProps, line) => {
      const material = line.material as LineBasicMaterial
      material.color.setStyle(originalProps.color)
      material.opacity = originalProps.opacity
      material.needsUpdate = true
    })
  }

  /**
   * ~ Uses the Raycaster to find the first interactive object under the mouse cursor
   * It checks for both celestial body meshes and their orbit lines
   *
   * @returns {CelestialBodyState | null} The state object of the intersected body, or null if there is no intersection
   */
  function findIntersectedBody(): CelestialBodyState | null {
    // * Update the raycaster with the current mouse and camera position
    raycaster.setFromCamera(mouse, camera)
    // * We only want to check for intersections with objects that are not the starfield
    const interactiveObjects = scene.children.filter((child: Object3D) => child.name !== 'starfield')
    const intersects = raycaster.intersectObjects(interactiveObjects, true)

    for (const intersect of intersects) {
      // * First, try to identify the intersection as a direct hit on a celestial body
      const foundBody = findBodyByIntersect(intersect.object)
      if (foundBody)
        return foundBody

      // * If it's not a body, check if it's an orbit line
      const foundOrbit = findOrbitByIntersect(intersect.object)
      if (foundOrbit) {
        // * If we hit an orbit line, we find the body that orbit belongs to
        const associatedBody = findBodyById(foundOrbit.bodyId)
        if (associatedBody)
          return associatedBody
      }
    }

    // * If no interactive objects were found, return null
    return null
  }

  /**
   * ~ Helper function to find a celestial body state by checking the `userData` of an intersected `Object3D`
   *
   * @param {Object3D} intersectedObject - The object returned by the Raycaster
   * @returns {CelestialBodyState | undefined} The corresponding celestial body state, or undefined if not found
   */
  function findBodyByIntersect(intersectedObject: Object3D) {
    if (!intersectedObject?.userData?.id)
      return null

    // * Find the body in our state array whose ID matches the one in the mesh's userData
    return celestialBodies.value.find(
      body => body.id === intersectedObject.userData.id,
    )
  }

  /**
   * ~ Helper function to find an orbit state by checking the `userData` of an intersected `Object3D`
   * This function traverses up the scene graph from the intersected object, as the ID might be on a parent
   *
   * @param {Object3D} intersectedObject - The object returned by the Raycaster
   * @returns {OrbitState | null | undefined} The corresponding orbit state, or null/undefined if not found.
   */
  function findOrbitByIntersect(intersectedObject: Object3D) {
    if (!intersectedObject?.userData?.id)
      return null

    let currentObject: Object3D | null = intersectedObject

    // * Traverse up the hierarchy from the intersected object
    while (currentObject) {
      const orbitId = currentObject.userData?.id
      // * Check if the userData ID contains "orbit" to identify it as an orbit line
      if (orbitId && orbitId.includes('orbit')) {
        return orbits.value.find(orbit => orbit.lineMesh && orbit.id === orbitId)
      }

      // * Move to the parent object
      currentObject = currentObject.parent

      // * Stop if we reach the top of the scene
      if (currentObject === scene)
        break
    }

    return null
  }

  /**
   * ~ Finds the orbit state associated with a given celestial body ID
   * @param {string} bodyId - The ID of the celestial body
   * @returns {OrbitState | undefined} The corresponding orbit state
   */
  function findOrbitByBodyId(bodyId: string): OrbitState | undefined {
    return orbits.value.find(orbit => orbit.bodyId === bodyId)
  }

  /**
   * ~ Finds the celestial body state for a given ID
   * @param {string} bodyId - The ID of the celestial body
   * @returns {CelestialBodyState | undefined} The corresponding celestial body state
   */
  function findBodyById(bodyId: string): CelestialBodyState | undefined {
    return celestialBodies.value.find(body => body.id === bodyId)
  }

  /**
   * ~ Event listener for `mousemove`. Updates the normalized mouse coordinates
   * @param {MouseEvent} event - The mouse move event
   */
  function onMouseMove(event: MouseEvent) {
    const canvasBounds = renderer.domElement.getBoundingClientRect()
    // * Convert mouse position from screen space to normalized device coordinates (-1 to +1)
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1
    mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1
  }

  /**
   * ~ Checks for intersections on hover and updates the `hoveredBody` state
   * This is called continuously from the animation loop
   */
  function checkHoverIntersection() {
    // * If a body is already selected, disable hover effects to avoid visual clutter
    if (selectedBody.value) {
      if (hoveredBody.value) {
        hoveredBody.value = null // ? clear any existing hover state
      }
      return
    }

    const bodyState = findIntersectedBody()

    if (bodyState) {
      // * If we're hovering over a new body, update the state
      if (hoveredBody.value?.id !== bodyState.id) {
        hoveredBody.value = bodyState
      }
    }
    else {
      // * If we're not hovering over anything, clear the state
      if (hoveredBody.value) {
        hoveredBody.value = null
      }
    }
  }

  /**
   * ~ Event listener for `click`. Updates the `selectedBody` state
   */
  function onClick() {
    const bodyState = findIntersectedBody()

    if (bodyState) {
      // * If we clicked on a body, select it
      selectedBody.value = bodyState
    }
    else {
      // * If we clicked on empty space, deselect everything
      selectedBody.value = null
    }
  }

  /**
   * ~ Event listener for keyboard events, providing shortcuts for interaction
   * @param {KeyboardEvent} event - The keyboard event
   */
  function onKeyDown(event: KeyboardEvent) {
    // * Pressing Space while focused on a body will exit focus mode
    if (event.code === 'Space' && selectedBody.value && isCameraFollowing.value) {
      event.preventDefault()
      selectedBody.value = null
      hoveredBody.value = null
      return
    }

    // * Pressing Escape will deselect and un-hover everything
    if (event.key === 'Escape') {
      hoveredBody.value = null
      selectedBody.value = null
    }
  }

  /**
   * ~ Initializes the interaction manager by setting up event listeners
   */
  const init = () => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onClick)
    window.addEventListener('keydown', onKeyDown)
    manageOutlineEffects()
  }

  /**
   * ~ Disposes of the interaction manager by cleaning up event listeners
   */
  const dispose = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('click', onClick)
    window.removeEventListener('keydown', onKeyDown)
  }

  return {
    init,
    dispose,
    checkHoverIntersection,
  }
}
