# Product Requirements Document: Nuxt Portfolio with Celestial Walker

## 1. Introduction

This document outlines the requirements for a personal portfolio website built using Nuxt.js. The portfolio will feature several sections, with a primary focus on an interactive 3D solar system representation called "Celestial Walker." Other sections will initially be placeholders.

## 2. Goals

- To create an engaging personal portfolio website.
- To showcase advanced front-end development skills, particularly with Nuxt.js and Three.js.
- To provide an interactive and educational experience with the Celestial Walker feature.
- To build a maintainable and scalable platform for future additions.

## 3. Target Audience

- Potential employers, collaborators, or clients visiting the portfolio.
- Anyone interested in interactive 3D web experiences.

## 4. Overall Functional Requirements

### 4.1. Home Page (`/`)

- **Purpose:** Entry point of the portfolio.
- **Functionality:**
  - Display navigation options (e.g., buttons or links) to the main sections:
    - Shopping List (`/shop-list`)
    - 3D Artworks Showcase (`/showcase`)
    - Celestial Walker (`/celestial-walker`)

### 4.2. Shopping List Page (`/shop-list`)

- **Purpose:** Placeholder for a future shopping list application.
- **Functionality (Initial):**
  - Display a title: "Shopping List".
  - Display a prominent "Work in progress" message.

### 4.3. 3D Artworks Showcase Page (`/showcase`)

- **Purpose:** Placeholder for a future showcase of 3D artworks.
- **Functionality (Initial):**
  - Display a title: "3D Artworks Showcase".
  - Display a prominent "Work in progress" message.

### 4.4. Celestial Walker Page (`/celestial-walker`)

- **Purpose:** Feature an interactive and detailed 3D representation of the solar system.
- **Core Technology:** Three.js integrated within a Nuxt/Vue component.
- **Data Source:** All celestial body properties, textures, and orbital mechanics will be loaded from a static JSON file (`solar_system.json`) provided by the user, aiming for high astronomical accuracy.

#### 4.4.1. Scene & Environment

- **Background:** Black, representing deep space.
- **Lighting:**
  - Soft ambient light to ensure visibility of unlit parts of objects.
  - The Sun will act as a primary light source.
- **Stars:** A starfield composed of particles, randomly scattered within a spherical boundary.

#### 4.4.2. The Sun

- **Geometry:** Spherical.
- **Visuals:**
  - Appropriate texture.
  - Emit light.
  - Post-processing bloom/glow effect that specifically targets the Sun and does not affect other scene elements.

#### 4.4.3. Planets

- **General:** Orbit the Sun according to data provided in `solar_system.json`. Each planet will have its own texture(s).
- **Earth:** Special case requiring multiple texture maps: day, night (for potential future use), specular, and normal maps.
- **Planetary Rings:**
  - Saturn and Uranus: Prominent ring systems.
  - Jupiter and Neptune: Faint ring systems.
  - Ring visuals (geometry, textures) based on provided data.

#### 4.4.4. Dwarf Planets

- Rendered as distinct celestial bodies (e.g., Ceres, Haumea, Makemake, Eris).
- Orbit the Sun at far distances, based on provided data.
- Appropriate textures.

#### 4.4.5. Moons

- Orbit their respective parent planets based on provided data.
- Appropriate textures.

#### 4.4.6. Orbit Trails

- **Display:** Visual lines representing the orbital paths of all orbiting bodies (planets, dwarf planets, moons).
- **Appearance:** Simple lines with 0.5 opacity.
- **Dynamic Thickness:** Trail thickness should dynamically adjust relative to the camera's zoom level to ensure visibility from various distances.

#### 4.4.7. Interactivity

- **Camera Controls:** Users can pan, zoom, and rotate the camera to explore the scene.
- **Hover Effect:**
  - When a user hovers the mouse cursor over a celestial body (Sun, planet, dwarf planet, moon), that body and its corresponding orbit trail will be highlighted with a specific color (color to be provided by the user, potentially via the JSON data).
- **Click Effect:**
  - When a user clicks on a celestial body:
    - A camera animation will smoothly transition to focus on the clicked body.
    - A floating information card will appear, displaying details about the selected body (information sourced from the JSON data).

## 5. Non-Functional Requirements

- **Performance:**
  - The Celestial Walker 3D scene must maintain a smooth frame rate (ideally 60 FPS, minimum 30 FPS) on modern desktop browsers.
  - Efficient loading and management of assets (textures, data).
- **Maintainability:**
  - Code must be clean, well-organized, and follow Vue/Nuxt best practices and the provided custom instructions (Composition API, composables for logic, etc.).
  - Three.js code should be modular and utilize resource disposal methods to prevent memory leaks.
- **Code Quality:**
  - Strict TypeScript.
  - JSDoc comments for functions and complex logic.
  - Descriptive naming conventions.
- **Scalability:** The architecture should allow for future expansion (e.g., adding more details to the solar system, new portfolio sections).
- **Data Accuracy:** The Celestial Walker should represent astronomical data (sizes, orbits, textures) as accurately as possible based on the user-provided JSON file.

## 6. Out of Scope (Initial Version)

- Full implementation of the Shopping List app.
- Full implementation of the 3D Artworks Showcase.
- User accounts, authentication, or backend database interactions.
- Complex physics simulations beyond visual orbital mechanics (e.g., gravitational interactions beyond simple parent-child orbits).
- Mobile-specific optimizations (initial focus is desktop).
