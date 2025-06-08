# Nuxt Portfolio Project

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

## Mission Details

### Phase 1: Requirements Analysis

**1. Functional Requirements:**

- **Application Framework:** Nuxt.js
- **Home Page (`/`):**
  - Presents buttons/links for users to choose and navigate to one of the three subpages (`/shop-list`, `/showcase`, `/celestial-walker`)
- **Shopping-List App (`/shop-list`):**
  - Accessible at this route
  - Placeholder: `<h1>Shopping List</h1>` and `<h2>Work in progress</h2>`
- **3D Artworks Showcase (`/showcase`):**
  - Accessible at this route
  - Will use Three.js
  - Placeholder: `<h1>3D Artworks Showcase</h1>` and `<h2>Work in progress</h2>`
- **Solar System Representation (`/celestial-walker`):**
  - Accessible at this route
  - Built with Three.js
  - **Realism:** Aims for high astronomical accuracy; all specific data (planet properties, textures, orbital mechanics) will be provided by the user
  - **Data Source:** Celestial body properties and orbital data loaded from a static JSON file
  - **Scene Details:**
    - Background: Black
    - Lighting: Soft ambient light
    - Stars: Particles, randomly scattered within a spherical boundary
    - Sun:
      - Geometry: Spherical
      - Properties: Emits light, texture
      - Effect: Glow/bloom post-processing effect, targeting only the Sun
  - **Celestial Bodies:**
    - Planets: Orbit the Sun, each with user-provided textures
      - Earth: Multiple textures (day, night, specular, normal maps)
      - Planets with Rings: Saturn and Uranus (prominent rings)
      - Planets with Faint Rings: Jupiter and Neptune
    - Dwarf Planets: Orbit the Sun at user-defined distances (e.g., Ceres, Haumea, Makemake, Eris)
    - Moons: Orbit their respective parent planets, based on user-provided data
  - **Visual Aids:**
    - Orbit Trails: Simple lines with 0.5 opacity for all orbiting objects. Thickness dynamically adjusts with camera zoom
  - **Interactivity:**
    - Camera Controls: User-controlled zoom, pan, and rotation
    - Hover Effect: On hovering a celestial object, the object and its orbit trail are highlighted with a user-specified color
    - Click Effect: Clicking a celestial object triggers a camera animation to focus on it, and a floating card displays its information

**2. Implied Requirements (Updated):**

- **Routing:** Nuxt.js handles navigation
- **3D Rendering Context:** Three.js `<canvas>`
- **Asset Management:** Nuxt's `public/` directory for textures and the static JSON data file. Efficient loading mechanisms
- **State Management (for `/celestial-walker`):**
  - Current camera position/target
  - Selected object for information display
  - Hovered object
- **UI Components (for `/celestial-walker`):**
  - Floating information card for celestial bodies
- **Event Handling:** Mouse interactions (hover, click) on the Three.js canvas

**3. Non-Functional Requirements:**

- **Performance:** Crucial for a smooth 3D experience
- **Maintainability:** Adherence to best practices and custom instructions
- **Scalability:** Future extensibility
- **Code Quality:** Typed, documented, organized

**4. Clarifying Questions:**

- None at this moment. Your answers were comprehensive.

**5. Current Understanding Confidence:** 90%

---

### Phase 2: System Context Examination

**1. Existing Codebase:**

- This is a new Nuxt.js application. The current workspace only contains `.gitignore` and `LICENSE`. We will be setting up the Nuxt project structure.
- I'll request to list the directory structure once Nuxt is initialized to understand its default layout.

**2. Key Nuxt.js Features & Integration Points:**

- **Directory Structure:** We will leverage Nuxt's standard directories:
  - `pages/`: For top-level routes like `index.vue` (home), `shop-list.vue`, `showcase.vue`, and `celestial-walker.vue`
  - `components/`: For reusable Vue components (e.g., the celestial body info card, buttons for the home page)
  - `composables/`: For Three.js logic, data fetching, state management related to the solar system
  - `public/`: For static assets like textures (e.g., `public/textures/earth_day.jpg`) and the celestial data JSON file (e.g., `public/data/solar_system.json`)
  - `layouts/`: For defining common page layouts, if needed (e.g., a default layout with a header/footer)
  - `assets/`: For global styles or other assets processed by the build tool (though `public/` is better for direct-access items like textures)
- **Routing:** Nuxt's file-system based routing will automatically create routes from the `.vue` files in the `pages/` directory
- **Vue 3 Composition API with `<script setup>`:** This will be the standard for all Vue components, including the one hosting the Three.js canvas
- **Three.js Integration:**
  - A specific Vue component (e.g., `components/SolarSystemCanvas.vue` or directly within `pages/celestial-walker.vue`) will be responsible for initializing and managing the Three.js scene
  - The Three.js renderer will attach to a `<canvas>` element in this component's template
  - Lifecycle hooks (`onMounted`, `onUnmounted`) will be critical for setting up and tearing down the Three.js scene to prevent memory leaks
- **Data Fetching:** The static JSON file for celestial bodies can be fetched using Nuxt's `$fetch` utility or the browser's `fetch` API within a composable

**3. External Systems:**

- None identified beyond the user's browser rendering the web application. We are not integrating with external APIs for data at this stage.

**4. System Boundaries and Responsibilities:**

- **Nuxt.js/Vue:**
  - Overall application structure, routing, and page rendering
  - UI elements outside the Three.js canvas (e.g., navigation buttons on the home page, the floating information card for celestial bodies)
  - Managing application state (e.g., which object is selected)
  - Handling user input that affects the broader UI (e.g., closing an info card)
- **Three.js (managed via composables):**
  - Rendering the 3D scene (stars, sun, planets, moons, rings, orbit trails)
  - Managing the camera, lighting, and post-processing effects (bloom for the Sun)
  - Handling 3D interactions (raycasting for hover/click detection on celestial bodies)
  - Implementing animations (celestial orbits, camera movements)
  - Loading and applying textures and materials to 3D objects
  - Calculating dynamic orbit trail thickness

**5. High-Level System Context Diagram (Conceptual):**

```
[User's Browser]
       |
       V
[Nuxt.js Application]
  |-- [Routing Engine] -> Manages page navigation
  |
  |-- [Home Page (`/`)] -> Vue Component with navigation buttons
  |     |-- Button -> `/shop-list`
  |     |-- Button -> `/showcase`
  |     |-- Button -> `/celestial-walker`
  |
  |-- [Shop-List Page (`/shop-list`)] -> Simple Vue Component (Placeholder)
  |
  |-- [Showcase Page (`/showcase`)] -> Simple Vue Component (Placeholder)
  |
  |-- [Celestial Walker Page (`/celestial-walker`)] -> Vue Component
  |     |-- [Three.js Canvas Element (`<canvas>`)]
  |     |-- [Floating Info Card UI Component (Vue)]
  |     |
  |     |-- [Composables (Logic Layer)]
  |          |-- `useSolarSystemData.ts` (Fetches and provides data from `solar_system.json`)
  |          |-- `useThreeScene.ts` (Initializes scene, camera, renderer, lights, stars)
  |          |-- `useCelestialBody.ts` (Creates/manages planets, moons, sun, rings, orbits)
  |          |-- `useInteraction.ts` (Handles hover, click, camera controls)
  |          |-- `usePostProcessing.ts` (Manages bloom effect for the Sun)
  |
  |-- [Static Assets (`public/`)]
        |-- `data/solar_system.json`
        |-- `textures/sun.jpg`, `textures/earth_day.jpg`, etc.
```

---

### Phase 3: Architecture Design

**1. Potential Architecture Patterns:**

Given the requirements (Nuxt app, significant Three.js portion, focus on maintainability and clean architecture principles from your custom instructions), the primary "architecture pattern" will be a **Component-Based Architecture** (inherent in Vue/Nuxt) augmented with a **Composable-Based Service Layer** for the Three.js and data logic.

- **Pattern 1: Monolithic Component Approach (Less Ideal)**

  - **Description:** Place most of the Three.js logic directly within the `pages/celestial-walker.vue` component
  - **Why appropriate (superficially):** Simple for a small demo
  - **Advantages:** Quick to start for a single, isolated 3D scene
  - **Drawbacks:**
    - Violates single responsibility principle
    - Hard to test and maintain as complexity grows
    - Makes code reuse difficult
    - The `celestial-walker.vue` component would become massive

- **Pattern 2: Component-Based with Composable Service Layer (Recommended)**

  - **Description:**
    - Vue components (`.vue` files in `pages/` and `components/`) handle UI presentation and user interaction dispatch
    - Composables (`.ts` files in `composables/`) encapsulate specific pieces of logic:
      - Three.js scene setup and rendering
      - Creation and management of celestial bodies
      - Interaction handling (raycasting, camera controls)
      - Data fetching and management
      - Post-processing effects
  - **Why appropriate:**
    - Aligns perfectly with Vue 3's Composition API and Nuxt 3's structure
    - Promotes separation of concerns (UI vs. logic)
    - Enhances testability and maintainability
    - Follows your custom instructions for clean architecture and Vue.js best practices
  - **Key Advantages:**
    - **Modularity:** Logic is broken down into manageable, reusable pieces (composables)
    - **Testability:** Composables can often be tested in isolation
    - **Readability:** Components remain lean and focused on templating and UI event handling
    - **Maintainability:** Easier to debug and update specific parts of the system
  - **Potential Drawbacks:**
    - Slightly more boilerplate initially compared to a monolithic approach (creating separate files for composables). This is a minor trade-off for long-term benefits

- **Pattern 3: External 3D Engine Abstraction (Overkill for now)**
  - **Description:** Create a more generic abstraction layer over Three.js, potentially making it easier to swap out the 3D engine in the future
  - **Why appropriate (in specific scenarios):** Useful if there's a high likelihood of changing the underlying 3D technology or if building a very large, complex 3D application framework
  - **Advantages:** Maximum flexibility and decoupling from a specific 3D library
  - **Drawbacks:**
    - Significant overhead and complexity for this project's current scope
    - May obscure Three.js-specific optimizations and features
    - Not necessary given the direct requirement to use Three.js

**2. Recommended Architecture Pattern:**
**Pattern 2: Component-Based with Composable Service Layer** is the clear choice. It aligns with modern Vue/Nuxt development, your custom instructions, and the project's needs for a maintainable and organized codebase, especially for the complex `/celestial-walker` feature.

**3. Core Components and Composables (Initial Draft):**

- **Nuxt Pages (`pages/`):**

  - `index.vue`: Home page with navigation buttons to sub-sections
  - `shop-list.vue`: Placeholder for the shopping list app
  - `showcase.vue`: Placeholder for the 3D artworks showcase
  - `celestial-walker.vue`:
    - Hosts the Three.js `<canvas>` element
    - Integrates various composables for the solar system functionality
    - Manages the layout including the floating info card

- **Vue Components (`components/`):**

  - `CelestialBodyInfoCard.vue`: Displays information about a selected celestial body
    - Props: `bodyData` (object), `isVisible` (boolean)
    - Emits: `close`
  - `NavigationButton.vue`: (Optional) A reusable button component for the home page

- **Composables (`composables/`):**
  - `useSolarSystemData.ts`:
    - Responsibility: Fetches celestial body data from `public/data/solar_system.json`. Provides reactive access to this data
    - Exports: `function getCelestialData(): Promise<SolarSystemDataInterface>`
  - `useThreeSceneManager.ts`:
    - Responsibility: Initializes and manages the core Three.js scene, camera, renderer, lights. Handles window resizing. Manages the main render loop
    - Needs: Reference to the `<canvas>` element
    - Exports: `function createScene(canvas: Ref<HTMLCanvasElement | undefined>): { scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, startRenderLoop: (onTick: () => void) => void, stopRenderLoop: () => void, setCameraPosition: (pos: Vector3) => void, lookAt: (target: Vector3) => void }`
  - `useStarfield.ts`:
    - Responsibility: Creates and adds the starfield particle system to the scene
    - Needs: `Scene` object
    - Exports: `function createStarfield(scene: Scene, count: number, radius: number): Points`
  - `useCelestialBodyFactory.ts`:
    - Responsibility: A factory to create and manage individual celestial bodies (Sun, planets, moons), including their meshes, materials (textures, multi-textures for Earth), rings, and orbit trail objects. Handles orbital mechanics (position updates per frame)
    - Needs: `Scene` object, celestial body data from `useSolarSystemData`
    - Exports: `function createCelestialBody(scene: Scene, bodyData: CelestialBodyDataInterface, isSun?: boolean): { threeObject: Object3D, updateOrbit: (time: number) => void, orbitTrail: Line, highlight: (color: Color) => void, unhighlight: () => void }`
    - (This might be broken down further if it becomes too large, e.g., `usePlanet.ts`, `useMoon.ts`, `useSun.ts`, `useRings.ts`, `useOrbitTrail.ts`)
  - `useInteractionManager.ts`:
    - Responsibility: Manages user interactions:
      - Camera controls (e.g., using `OrbitControls` from Three.js)
      - Raycasting for hover and click detection on celestial bodies
      - Managing hover effects (calling highlight methods on celestial bodies)
      - Managing click effects (camera animation, emitting event to show info card)
    - Needs: `Camera`, `Scene`, list of interactable `Object3D`s, DOM element for event listeners
    - Exports: `function setupInteractions(camera: PerspectiveCamera, rendererDomElement: HTMLElement, scene: Scene, interactableObjects: Ref<Object3D[]>, onObjectHover: (object: Object3D | null) => void, onObjectClick: (object: Object3D) => void): { controls: OrbitControls, dispose: () => void }`
  - `usePostProcessing.ts`:
    - Responsibility: Sets up and manages post-processing effects, specifically the bloom effect for the Sun
    - Needs: `Scene`, `Camera`, `Renderer`
    - Exports: `function createBloomEffect(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, sunObject: Object3D): { composer: EffectComposer, update: () => void }`
  - `useCameraAnimator.ts`:
    - Responsibility: Handles camera animations, e.g., smoothly moving the camera to focus on a clicked celestial body
    - Needs: `Camera`
    - Exports: `function animateCameraToTarget(camera: PerspectiveCamera, targetPosition: Vector3, targetLookAt: Vector3, duration?: number): Promise<void>`

---

### Phase 4: Technical Specification

**1. Recommended Technologies:**

- **Framework:** Nuxt 3 (Vue 3) - As specified
- **Language:** TypeScript (strict mode) - As specified
- **Package Manager:** PNPM - As specified
- **3D Library:** Three.js - As specified
- **UI Styling:**
  - Option 1: Standard CSS/SCSS within Vue components
  - Option 2: Tailwind CSS (if you prefer utility-first CSS). Nuxt has a module for Tailwind (`@nuxtjs/tailwindcss`)
  - _Recommendation:_ Start with standard CSS/SCSS scoped to components. It's simpler for the current scale. If styling needs become complex, Tailwind can be added later
- **State Management (Simple):** Vue's `ref`, `reactive`, and `provide`/`inject` for local component state and simple cross-component communication (e.g., selected object for the info card). For the solar system data, a reactive ref holding the fetched JSON will be sufficient
- **Linting/Formatting:** ESLint (already set up with `eslint.config.mjs`) and Prettier. I recommend adding Prettier and configuring it to work with ESLint
- **Data Format:** JSON for `solar_system.json`

**2. Implementation Phases & Dependencies:**

- **Phase 0: Project Setup & Basic Pages**

  - Task 1: Create directories: `pages`, `components`, `composables`, `public/data`, `public/textures`
  - Task 2: Implement basic placeholder pages:
    - `pages/index.vue` (with navigation buttons)
    - `pages/shop-list.vue` (with `<h1>Shopping List</h1><h2>Work in progress</h2>`)
    - `pages/showcase.vue` (with `<h1>3D Artworks Showcase</h1><h2>Work in progress</h2>`)
  - Task 3: Implement `pages/celestial-walker.vue` (initially just a title and a placeholder for the canvas)
  - Task 4: Setup basic routing (Nuxt handles this automatically based on `pages/`)
  - Task 5: Create `public/data/solar_system.json` with a minimal structure (e.g., just the Sun and Earth with basic properties) for initial testing
  - Task 6: Add a couple of placeholder texture images to `public/textures/`
  - _Dependencies:_ None. This is the foundational phase

- **Phase 1: Core Three.js Scene Setup (`/celestial-walker`)**

  - Task 1.1: Implement `useThreeSceneManager.ts`:
    - Initialize `Scene`, `PerspectiveCamera`, `WebGLRenderer`
    - Append renderer's DOM element to a `div` in `celestial-walker.vue`
    - Add basic ambient light and a point light (for the Sun initially)
    - Implement the render loop
    - Handle window resize
  - Task 1.2: Integrate `useThreeSceneManager` into `celestial-walker.vue`
  - Task 1.3: Implement `useStarfield.ts` to create a basic starfield and add it via `celestial-walker.vue`
  - _Dependencies:_ Phase 0

- **Phase 2: Data Loading & Basic Celestial Bodies (`/celestial-walker`)**

  - Task 2.1: Define TypeScript interfaces for the `solar_system.json` structure (e.g., `SolarSystemData`, `PlanetData`, `MoonData`, `OrbitParams`, etc.) in a `types/solar-system.types.ts` file
  - Task 2.2: Implement `useSolarSystemData.ts` to fetch and parse `solar_system.json`
  - Task 2.3: Implement a basic version of `useCelestialBodyFactory.ts`:
    - Focus on creating the Sun (as a simple sphere with basic material) and Earth (sphere with basic material)
    - Implement simple circular orbit logic (ignoring full Keplerian elements for now, just radius and speed)
    - Load and apply basic textures
  - Task 2.4: In `celestial-walker.vue`, use `useSolarSystemData` to get data and `useCelestialBodyFactory` to create and add the Sun and Earth to the scene
  - _Dependencies:_ Phase 1. User-provided `solar_system.json` (at least partial) and textures

- **Phase 3: Advanced Celestial Bodies & Orbit Trails (`/celestial-walker`)**

  - Task 3.1: Enhance `useCelestialBodyFactory.ts`:
    - Implement creation of all planet types and dwarf planets
    - Implement multi-texture loading and material setup for Earth (day, specular, normal maps). Night map can be added if a dynamic day/night cycle is implemented later (out of scope for initial realistic orbit)
    - Implement ring creation for Saturn, Uranus (and faint rings for Jupiter, Neptune)
    - Implement moon creation and attach them to their parent planets
    - Implement accurate orbital mechanics based on provided Keplerian elements from `solar_system.json`
  - Task 3.2: Implement `useOrbitTrail.ts` (or integrate into `useCelestialBodyFactory.ts`):
    - Generate and display orbit trails (simple lines with 0.5 opacity)
  - _Dependencies:_ Phase 2. Complete `solar_system.json` data and all required textures

- **Phase 4: Interactivity (`/celestial-walker`)**

  - Task 4.1: Implement `useInteractionManager.ts`:
    - Add `OrbitControls` for camera manipulation
    - Implement raycasting for hover and click
  - Task 4.2: Implement hover effect:
    - `useCelestialBodyFactory`'s objects should have `highlight(color)` and `unhighlight()` methods
    - `useInteractionManager` calls these on hover. The highlight color will be provided by the user (can be part of the JSON data or a constant)
    - Orbit trails should also be highlighted
  - Task 4.3: Implement click effect:
    - Implement `useCameraAnimator.ts` for smooth camera transitions
    - Create `components/CelestialBodyInfoCard.vue`
    - On click, `useInteractionManager` triggers camera animation (via `useCameraAnimator`) and emits an event to `celestial-walker.vue` with the clicked object's data
    - `celestial-walker.vue` shows and populates `CelestialBodyInfoCard.vue`
  - Task 4.4: Dynamic orbit trail thickness in `useOrbitTrail.ts` (or `useCelestialBodyFactory.ts`):
    - Adjust line material thickness based on camera distance to the solar system's center or average planet distance
  - _Dependencies:_ Phase 3

- **Phase 5: Post-Processing & Refinements (`/celestial-walker`)**
  - Task 5.1: Implement `usePostProcessing.ts` for the Sun's bloom effect
    - Use `EffectComposer` and `UnrealBloomPass` from Three.js
    - Configure it to only affect the Sun (e.g., using layers or by rendering Sun to a separate render target for bloom)
  - Task 5.2: General performance optimizations (texture compression, geometry optimization if needed, draw call reduction)
  - Task 5.3: Code cleanup, documentation (JSDoc), final review against custom instructions
  - _Dependencies:_ Phase 4

**3. Technical Risks and Mitigation Strategies:**

- **Risk 1: Performance issues with many objects, textures, and effects**

  - **Mitigation:**
    - Use Three.js performance best practices: instancing (if applicable, though celestial bodies are unique), texture atlases (if many small textures), LOD (Level of Detail - probably overkill for this), frustum culling (default in Three.js)
    - Optimize texture sizes and use compressed formats (e.g., KTX2 with Basis Universal, though this adds complexity; start with JPG/PNG)
    - Profile using browser dev tools and `Stats.js`
    - Implement dynamic orbit trail thickness carefully to avoid performance hit during camera zoom
    - For stars, ensure particle system is efficient

- **Risk 2: Complexity of accurate orbital mechanics**

  - **Mitigation:**
    - User provides all orbital parameters. The key is to correctly implement the math to convert Keplerian elements (or simplified parameters) to Cartesian coordinates over time
    - Start with simplified circular orbits, then iterate to full Keplerian if necessary and if data provides it. Often, for visualization, mean anomalies and periods are enough to give a good representation without full n-body simulation
    - Refer to reliable astronomical formulas and Three.js examples

- **Risk 3: Managing Three.js object lifecycles and preventing memory leaks**

  - **Mitigation:**
    - Diligently use `dispose()` methods on geometries, materials, and textures when objects are removed or the scene is torn down (e.g., in Vue's `onUnmounted` hook)
    - Composables that create Three.js objects should also provide cleanup functions

- **Risk 4: Achieving the specific Sun bloom effect (affecting only the Sun)**

  - **Mitigation:**
    - Use Three.js layers: Assign the Sun to a specific layer, and configure the bloom pass to only render that layer
    - Alternatively, render the Sun to an offscreen render target, apply bloom to that target, then composite it back. Layers are often simpler

- **Risk 5: Cross-browser/device compatibility of WebGL features**
  - **Mitigation:**
    - Stick to widely supported WebGL1/WebGL2 features. Three.js handles many abstractions
    - Test on target browsers (Chrome, Firefox, Safari, Edge)
    - Provide fallbacks or graceful degradation if very advanced features are used (not planned for now)

**4. Technical Success Criteria:**

- All specified pages (`/`, `/shop-list`, `/showcase`, `/celestial-walker`) are implemented and accessible
- `/celestial-walker` loads and displays the solar system based on `solar_system.json`
- All specified celestial bodies (Sun, planets with multi-textures/rings, dwarf planets, moons) are rendered with their textures and orbit trails
- Orbits are animated, reflecting realistic (or user-provided simplified) mechanics
- User can control the camera (pan, zoom, rotate)
- Hovering over a celestial body highlights it and its trail
- Clicking a celestial body animates the camera to it and displays an info card
- Sun has a bloom effect that does not affect other objects
- Orbit trail thickness is dynamic with zoom
- Application maintains smooth performance (e.g., >30 FPS, ideally 60 FPS) on target desktop browsers
- Code adheres to the custom instructions (TypeScript, PNPM, Vue Composition API, composable structure, JSDoc, etc.)
- No console errors during normal operation
- Proper disposal of Three.js resources on page navigation or component unmount

**5. Final Confidence Level:** 95%

---
