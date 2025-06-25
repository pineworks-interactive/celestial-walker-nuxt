## Task 1: State Management Setup

- Create composables/interactionState.ts.
- Define and export hoveredBody and selectedBody refs.

## Task 2: Hover Information Display

- Create composables/useInteractionManager.ts.
- In useThreeSceneManager.ts, instantiate the interaction manager in initialize and pass it the scene, camera, and the list of celestial body meshes.
- In useInteractionManager.ts, implement the mousemove listener and raycasting logic to update interactionState.hoveredBody.
- Modify components/scene-overlay/corners/CornerSW.vue to read from interactionState.hoveredBody and display the name or "target".

## Task 3: Camera Animation

- Add gsap to the project: pnpm add gsap.
- Create composables/useCameraManager.ts.
- Implement the `focusOnBody(target)` and `resetCamera()` methods using gsap.to(). This will involve tweening `camera.position` and `controls.target`
- In useThreeSceneManager.ts, instantiate the camera manager and set up a watch on interactionState.selectedBody to call the appropriate camera manager methods.

## Task 4: Click Interaction & Info Window

- In useInteractionManager.ts, implement the click listener to update interactionState.selectedBody.
- Implement the Escape key listener to clear interactionState.selectedBody.
- Create the components/scene-overlay/InfoWindow.vue component.
- Style the component to be a scrollable panel on the right side of the screen.
- The component should use v-if="selectedBody" to control its visibility and populate its content from the selectedBody data.
