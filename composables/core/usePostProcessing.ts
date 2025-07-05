/**
 * @module usePostProcessing
 * @description This module sets up and manages the post-processing pipeline for the 3JS scene
 * It uses `EffectComposer` to chain together different visual effects, such as bloom for glow
 * and an outline pass for highlighting interactive objects
 */
import type { useThreeCore } from '@/composables/core/useThreeCore'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { toRaw, watch } from 'vue'
import { outlineColor, outlinedObjects, outlineParams } from '~/composables/state/effectsState'

type ThreeCore = ReturnType<typeof useThreeCore>

/**
 * # Initializes and configures the post-processing effects for the scene
 *
 * @param {ThreeCore} threeCore - The core 3JS components, unwrapped to their raw values to avoid proxy issues
 * @returns {object} An object containing the configured `EffectComposer` instance
 */
export function usePostProcessing(threeCore: ThreeCore) {
  const { renderer, scene, camera } = threeCore

  // * The EffectComposer is the heart of the post-processing pipeline
  // * We pass it the raw renderer to ensure compatibility
  const composer = new EffectComposer(toRaw(renderer.value))

  // * The first pass is always the RenderPass, which renders the base scene
  const renderPass = new RenderPass(toRaw(scene.value), toRaw(camera.value))
  composer.addPass(renderPass)

  // * The UnrealBloomPass creates a nice "glow" effect for bright objects like the sun
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
  bloomPass.threshold = 0 // ? the brightness threshold to trigger the bloom effect. 0 means everything blooms
  bloomPass.strength = 0.4 // ? how intense the bloom is
  bloomPass.radius = 0 // ? the radius of the bloom
  composer.addPass(bloomPass)

  // * The OutlinePass is used to draw an outline around selected or hovered objects
  const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), toRaw(scene.value), toRaw(camera.value))
  outlinePass.selectedObjects = [] // ? start with no objects selected. This will be updated reactively
  outlinePass.edgeStrength = outlineParams.edgeStrength
  outlinePass.edgeGlow = outlineParams.edgeGlow
  outlinePass.edgeThickness = outlineParams.edgeThickness
  outlinePass.pulsePeriod = outlineParams.pulsePeriod
  outlinePass.visibleEdgeColor.set(outlineColor.value)
  outlinePass.hiddenEdgeColor.set(outlineColor.value)
  composer.addPass(outlinePass)

  // * --- Reactive Watchers ---

  // * This watcher is crucial. It listens for changes to our global `outlinedObjects` state (which stores names)
  // * When the state changes, it finds the actual THREE.Object3D objects in the scene and updates the pass
  watch(outlinedObjects, (names) => {
    const rawScene = toRaw(scene.value)
    // * Map the array of names to an array of Object3D, filtering out any that aren't found
    const objects = names.map(name => rawScene.getObjectByName(name)).filter(Boolean) as THREE.Object3D[]
    outlinePass.selectedObjects = objects
  })

  // * This watcher updates the outline color when the global `outlineColor` state changes
  watch(outlineColor, (newColor) => {
    // * We use toRaw here to ensure we're passing the raw Color object, not a Vue proxy
    outlinePass.visibleEdgeColor.set(toRaw(newColor))
    outlinePass.hiddenEdgeColor.set(toRaw(newColor))
  })

  return {
    composer,
  }
}
