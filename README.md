# Architecture Guide

## Table of Contents

### English

1. [Architecture Overview](#architecture-overview)
2. [Core Composables](#core-composables)
3. [Data Management](#data-management)
4. [Factories](#factories)
5. [Features](#features)
6. [State Management](#state-management)
7. [Scene Orchestrator](#scene-orchestrator)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)

### Français

1. [Vue d'ensemble de l'architecture](#vue-densemble-de-larchitecture)
2. [Composables de base](#composables-de-base)
3. [Gestion des données](#gestion-des-données)
4. [Factories](#factories-fr)
5. [Fonctionnalités](#fonctionnalités)
6. [Gestion d'état](#gestion-détat)
7. [Orchestrateur de scène](#orchestrateur-de-scène)
8. [Exemples d'utilisation](#exemples-dutilisation)
9. [Bonnes pratiques](#bonnes-pratiques)

---

# English Documentation

## Architecture Overview

The composables directory follows a clean, modular architecture based on the Single Responsibility Principle. Each composable handles a specific aspect of the 3JS solar system visualization application.

### Directory Structure

```
composables/
├── core/                          # Fundamental 3JS components
│   ├── useAnimationLoop.ts        # Render loop and orbital animations
│   ├── usePostProcessing.ts       # Visual effects (bloom, outline)
│   └── useThreeCore.ts            # Basic 3JS setup (scene, camera, renderer)
├── data/                          # Data fetching and management
│   └── useSolarSystemData.ts      # Solar system data loading
├── factories/                     # Object creation patterns
│   ├── useCelestialBodyFactory.ts # Planet/star creation
│   └── useOrbitFactory.ts         # Orbital mechanics and visualization
├── features/                      # Specific application features
│   ├── useCameraManager.ts        # Camera movements and controls
│   ├── useInteractionManager.ts   # Mouse/keyboard interactions
│   ├── useSceneLoader.ts          # Scene initialization and loading
│   ├── useStarfield.ts            # Background star generation
│   ├── useTacticalView.ts         # Top-down view mode
│   ├── useVisualisation.ts        # Debug visualization tools
│   └── useZoomManager.ts          # Zoom level management
├── state/                         # Reactive state management
│   ├── cameraState.ts             # Camera position and distance
│   ├── effectsState.ts            # Post-processing effects state
│   ├── interactionState.ts        # User interaction state
│   └── visualisationState.ts      # Debug visualization state
└── useSceneOrchestrator.ts        # Main orchestrator (legacy, being phased out)
```

## Core Composables

### useThreeCore.ts

**Purpose**: Initializes fundamental 3JS components (scene, camera, renderer, controls).

**Key Features**:

- Creates WebGL renderer with optimal settings
- Sets up PerspectiveCamera with configurable parameters
- Initializes OrbitControls for user interaction
- Provides cleanup and resize handling methods

**Dependencies**: None (base level)

**Usage**:

```typescript
const threeCore = useThreeCore(canvasElement)
const { scene, camera, renderer, controls, cleanup, onResize } = threeCore
```

**Integration**: Used by all other composables that need access to core 3JS objects.

### usePostProcessing.ts

**Purpose**: Sets up visual effects pipeline including bloom and outline effects.

**Key Features**:

- EffectComposer for post-processing pipeline
- UnrealBloomPass for glow effects
- OutlinePass for object selection highlighting
- Dynamic outline color management

**Dependencies**:

- `useThreeCore` (requires scene, camera, renderer)
- `effectsState` (outline objects and colors)

**Usage**:

```typescript
const { composer } = usePostProcessing(threeCore)
```

### useAnimationLoop.ts

**Purpose**: Manages the main render loop and orbital animations.

**Key Features**:

- Handles orbital mechanics calculations
- Updates camera following behavior
- Manages zoom level calculations
- Coordinates with all animated objects

**Dependencies**:

- `useThreeCore`
- `useCameraManager`
- `useSolarSystemData`
- `useZoomManager`
- Multiple state files

**Usage**:

```typescript
const { start, stop } = useAnimationLoop(threeCore, composer, cameraManager)
start() // Begin animation loop
```

## Data Management

### useSolarSystemData.ts

**Purpose**: Fetches and manages solar system data from JSON files.

**Key Features**:

- Singleton pattern for shared data access
- Async data loading with error handling
- Reactive state management
- Type-safe data parsing

**Dependencies**: None

**Usage**:

```typescript
const { data, loading, error, loadData } = useSolarSystemData()
await loadData()
```

**Data Structure**: Provides access to sun, planets, satellites, and their properties (physical, orbital, textures).

## Factories

### useCelestialBodyFactory.ts

**Purpose**: Creates 3JS meshes for celestial bodies (planets, stars, satellites).

**Key Features**:

- Singleton pattern to prevent memory leaks
- Texture loading and material creation
- Geometry scaling based on real astronomical data
- Proper resource disposal

**Dependencies**:

- Configuration files (colors, scaling)

**Usage**:

```typescript
const { createSun, createPlanet, cleanup } = useCelestialBodyFactory()
const sunMesh = await createSun(sunData)
const planetMesh = await createPlanet(planetData)
```

### useOrbitFactory.ts

**Purpose**: Creates orbital mechanics and visual orbit paths.

**Key Features**:

- Orbital pivot creation with proper scaling
- Visual orbit line generation
- Orbital parameter calculations
- Resource management for cleanup

**Dependencies**:

- Configuration files (scaling, colors)

**Usage**:

```typescript
const { createOrbit, createOrbitLine, cleanupLines } = useOrbitFactory()
const orbit = createOrbit(distanceKm, centralBodyRadius, speed, name)
const orbitLine = createOrbitLine(radius)
```

## Features

### useCameraManager.ts

**Purpose**: Handles all camera movements, animations, and behaviors.

**Key Features**:

- Smooth camera focusing on celestial bodies
- Camera following behavior
- Tactical view (top-down) mode
- GSAP-powered smooth animations

**Dependencies**:

- GSAP for animations
- State management files
- Scene configuration

**Usage**:

```typescript
const cameraManager = useCameraManager(camera, controls)
cameraManager.focusOnBody(celestialBody)
cameraManager.toggleTacticalView()
```

### useInteractionManager.ts

**Purpose**: Manages user interactions (mouse, keyboard) with the scene.

**Key Features**:

- Raycasting for object selection
- Hover and selection state management
- Keyboard shortcuts
- Visual feedback coordination

**Dependencies**:

- State management files
- 3JS raycasting

**Usage**:

```typescript
const interactionManager = useInteractionManager(scene, camera, renderer, celestialBodies)
interactionManager.init()
```

### useSceneLoader.ts

**Purpose**: Orchestrates the loading and creation of all scene objects.

**Key Features**:

- Data loading coordination
- Object creation sequencing
- Registration with debug systems
- Error handling for loading failures

**Dependencies**:

- Data management
- Factories
- Visualization system

**Usage**:

```typescript
const { load } = useSceneLoader()
await load(scene)
```

### useStarfield.ts

**Purpose**: Creates and manages the background starfield.

**Key Features**:

- Procedural star generation
- Configurable density and distribution
- Performance-optimized particle system
- Proper cleanup handling

**Dependencies**: Scene configuration

**Usage**:

```typescript
const { starfield, cleanup } = useStarfield(scene, options)
```

### useTacticalView.ts

**Purpose**: Provides global access to tactical view functionality.

**Key Features**:

- Global state management for tactical view
- Registration system for camera manager
- Simple API for view toggling

**Dependencies**: Interaction state

**Usage**:

```typescript
const { isTacticalViewActive, toggleTacticalView } = useTacticalView()
```

### useVisualisation.ts

**Purpose**: Provides debugging visualization tools (wireframes, helpers, axes).

**Key Features**:

- Individual object visualization controls
- Global visualization toggles
- 3JS helper management (AxesHelper, GridHelper)
- Registration system for objects

**Dependencies**: Visualization state

**Usage**:

```typescript
const { toggleBodyWireframe, toggleGlobalAxes } = useDebugActions()
toggleBodyWireframe('earth')
toggleGlobalAxes()
```

### useZoomManager.ts

**Purpose**: Manages zoom level calculations and state.

**Key Features**:

- Zoom level calculation (0-10 scale)
- Reactive zoom state
- Zoom threshold management

**Dependencies**: None

**Usage**:

```typescript
const { zoomLevel, setZoomLevel } = useZoomManager()
setZoomLevel(5)
```

## State Management

### cameraState.ts

**Purpose**: Reactive state for camera distance and position.

**Exports**:

- `cameraDistance` (readonly)
- `setCameraDistance(distance: number)`

### effectsState.ts

**Purpose**: State for post-processing effects and object highlighting.

**Exports**:

- `outlinedObjects` - Objects to be outlined
- `outlineColor` - Current outline color
- `outlineParams` - Outline effect parameters
- `HOVER_COLOR`, `SELECT_COLOR` - Predefined colors

### interactionState.ts

**Purpose**: State for user interactions and selected objects.

**Exports**:

- `hoveredBody` - Currently hovered celestial body
- `selectedBody` - Currently selected celestial body
- `isCameraFollowing` - Camera following state
- `isInfoWindowOpen` - Info window visibility
- `isTacticalViewActive` - Tactical view state

### visualisationState.ts

**Purpose**: State for debug visualization tools and registered objects.

**Exports**:

- `globalWireframe`, `globalAxes`, `globalGrids` - Global toggles
- `celestialBodies`, `orbits` - Registered objects
- Computed properties for UI integration

## Scene Orchestrator

### useSceneOrchestrator.ts

**Purpose**: Legacy main orchestrator being phased out in favor of modular architecture.

**Status**: This file contains the old monolithic approach and is being replaced by the smaller, focused composables described above.

## Usage Examples

### Basic Scene Setup

```typescript
// 1. Initialize core 3JS components
const threeCore = useThreeCore(canvas)

// 2. Set up post-processing
const { composer } = usePostProcessing(threeCore)

// 3. Create camera manager
const cameraManager = useCameraManager(threeCore.camera.value, threeCore.controls.value)

// 4. Set up interactions
const interactionManager = useInteractionManager(
  threeCore.scene.value,
  threeCore.camera.value,
  threeCore.renderer.value,
  celestialBodies
)

// 5. Load scene data and objects
const { load } = useSceneLoader()
await load(threeCore.scene.value)

// 6. Start animation loop
const { start } = useAnimationLoop(threeCore, composer, cameraManager)
start()
```

### Adding Debug Visualization

```typescript
const { toggleBodyWireframe, registerCelestialBody } = useDebugActions()

// Register a celestial body for debugging
registerCelestialBody('earth', 'Earth', 'Third planet from the Sun', earthMesh)

// Toggle wireframe mode
toggleBodyWireframe('earth')
```

### Handling User Interactions

```typescript
// Watch for selected body changes
watch(selectedBody, (newBody) => {
  if (newBody) {
    cameraManager.focusOnBody(newBody)
  }
  else {
    cameraManager.resetCamera()
  }
})
```

## Best Practices

### 1. Dependency Management

- Always use the singleton pattern for resource-heavy composables
- Import only what you need to avoid circular dependencies
- Use type imports when possible

### 2. Resource Cleanup

- Always call cleanup methods in `onUnmounted`
- Dispose of 3JS objects properly
- Clear animation frames and event listeners

### 3. State Management

- Use readonly refs for state that shouldn't be modified externally
- Prefer computed properties for derived state
- Keep state as minimal as possible

### 4. Error Handling

- Wrap async operations in try-catch blocks
- Provide meaningful error messages
- Handle edge cases gracefully

### 5. Performance

- Use `shallowRef` for 3JS objects
- Avoid reactive wrapping of complex objects
- Implement proper disposal patterns

---

# Documentation Française

## Vue d'ensemble de l'architecture

Le répertoire composables suit une architecture modulaire et propre basée sur le principe de responsabilité unique. Chaque composable gère un aspect spécifique de l'application de visualisation du système solaire avec 3JS.

### Structure du répertoire

```
composables/
├── core/                          # Composants 3JS fondamentaux
│   ├── useAnimationLoop.ts        # Boucle de rendu et animations orbitales
│   ├── usePostProcessing.ts       # Effets visuels (bloom, contour)
│   └── useThreeCore.ts            # Configuration 3JS de base
├── data/                          # Récupération et gestion des données
│   └── useSolarSystemData.ts      # Chargement des données du système solaire
├── factories/                     # Patterns de création d'objets
│   ├── useCelestialBodyFactory.ts # Création de planètes/étoiles
│   └── useOrbitFactory.ts         # Mécanique orbitale et visualisation
├── features/                      # Fonctionnalités spécifiques
│   ├── useCameraManager.ts        # Mouvements et contrôles de caméra
│   ├── useInteractionManager.ts   # Interactions souris/clavier
│   ├── useSceneLoader.ts          # Initialisation et chargement de scène
│   ├── useStarfield.ts            # Génération d'étoiles d'arrière-plan
│   ├── useTacticalView.ts         # Mode vue de dessus
│   ├── useVisualisation.ts        # Outils de visualisation debug
│   └── useZoomManager.ts          # Gestion du niveau de zoom
├── state/                         # Gestion d'état réactif
│   ├── cameraState.ts             # Position et distance de caméra
│   ├── effectsState.ts            # État des effets de post-traitement
│   ├── interactionState.ts        # État des interactions utilisateur
│   └── visualisationState.ts      # État de visualisation debug
└── useSceneOrchestrator.ts        # Orchestrateur principal (legacy)
```

## Composables de base

### useThreeCore.ts

**Objectif** : Initialise les composants 3JS fondamentaux (scène, caméra, renderer, contrôles).

**Fonctionnalités clés** :

- Crée un renderer WebGL avec des paramètres optimaux
- Configure une PerspectiveCamera avec des paramètres configurables
- Initialise OrbitControls pour l'interaction utilisateur
- Fournit des méthodes de nettoyage et de redimensionnement

**Dépendances** : Aucune (niveau de base)

**Utilisation** :

```typescript
const threeCore = useThreeCore(canvasElement)
const { scene, camera, renderer, controls, cleanup, onResize } = threeCore
```

**Intégration** : Utilisé par tous les autres composables nécessitant l'accès aux objets 3JS de base.

### usePostProcessing.ts

**Objectif** : Configure le pipeline d'effets visuels incluant les effets de bloom et de contour.

**Fonctionnalités clés** :

- EffectComposer pour le pipeline de post-traitement
- UnrealBloomPass pour les effets de lueur
- OutlinePass pour la mise en surbrillance de sélection d'objets
- Gestion dynamique des couleurs de contour

**Dépendances** :

- `useThreeCore` (nécessite scene, camera, renderer)
- `effectsState` (objets et couleurs de contour)

**Utilisation** :

```typescript
const { composer } = usePostProcessing(threeCore)
```

### useAnimationLoop.ts

**Objectif** : Gère la boucle de rendu principale et les animations orbitales.

**Fonctionnalités clés** :

- Gère les calculs de mécanique orbitale
- Met à jour le comportement de suivi de caméra
- Gère les calculs de niveau de zoom
- Coordonne avec tous les objets animés

**Dépendances** :

- `useThreeCore`
- `useCameraManager`
- `useSolarSystemData`
- `useZoomManager`
- Multiples fichiers d'état

**Utilisation** :

```typescript
const { start, stop } = useAnimationLoop(threeCore, composer, cameraManager)
start() // Commence la boucle d'animation
```

## Gestion des données

### useSolarSystemData.ts

**Objectif** : Récupère et gère les données du système solaire depuis des fichiers JSON.

**Fonctionnalités clés** :

- Pattern singleton pour l'accès partagé aux données
- Chargement de données asynchrone avec gestion d'erreurs
- Gestion d'état réactif
- Analyse de données type-safe

**Dépendances** : Aucune

**Utilisation** :

```typescript
const { data, loading, error, loadData } = useSolarSystemData()
await loadData()
```

**Structure de données** : Fournit l'accès au soleil, aux planètes, aux lunes et leurs propriétés (physiques, orbitales, textures).

## Factories {#factories-fr}

### useCelestialBodyFactory.ts

**Objectif** : Crée des maillages 3JS pour les corps célestes (planètes, étoiles, lunes).

**Fonctionnalités clés** :

- Pattern singleton pour prévenir les fuites mémoire
- Chargement de textures et création de matériaux
- Mise à l'échelle de géométrie basée sur des données astronomiques réelles
- Disposal approprié des ressources

**Dépendances** :

- Fichiers de configuration (couleurs, mise à l'échelle)

**Utilisation** :

```typescript
const { createSun, createPlanet, cleanup } = useCelestialBodyFactory()
const sunMesh = await createSun(sunData)
const planetMesh = await createPlanet(planetData)
```

### useOrbitFactory.ts

**Objectif** : Crée la mécanique orbitale et les chemins d'orbite visuels.

**Fonctionnalités clés** :

- Création de pivot orbital avec mise à l'échelle appropriée
- Génération de lignes d'orbite visuelles
- Calculs de paramètres orbitaux
- Gestion des ressources pour le nettoyage

**Dépendances** :

- Fichiers de configuration (mise à l'échelle, couleurs)

**Utilisation** :

```typescript
const { createOrbit, createOrbitLine, cleanupLines } = useOrbitFactory()
const orbit = createOrbit(distanceKm, centralBodyRadius, speed, name)
const orbitLine = createOrbitLine(radius)
```

## Fonctionnalités

### useCameraManager.ts

**Objectif** : Gère tous les mouvements, animations et comportements de caméra.

**Fonctionnalités clés** :

- Focalisation fluide de caméra sur les corps célestes
- Comportement de suivi de caméra
- Mode vue tactique (vue de dessus)
- Animations fluides propulsées par GSAP

**Dépendances** :

- GSAP pour les animations
- Fichiers de gestion d'état
- Configuration de scène

**Utilisation** :

```typescript
const cameraManager = useCameraManager(camera, controls)
cameraManager.focusOnBody(celestialBody)
cameraManager.toggleTacticalView()
```

### useInteractionManager.ts

**Objectif** : Gère les interactions utilisateur (souris, clavier) avec la scène.

**Fonctionnalités clés** :

- Raycasting pour la sélection d'objets
- Gestion d'état de survol et sélection
- Raccourcis clavier
- Coordination de feedback visuel

**Dépendances** :

- Fichiers de gestion d'état
- Raycasting 3JS

**Utilisation** :

```typescript
const interactionManager = useInteractionManager(scene, camera, renderer, celestialBodies)
interactionManager.init()
```

### useSceneLoader.ts

**Objectif** : Orchestre le chargement et la création de tous les objets de scène.

**Fonctionnalités clés** :

- Coordination du chargement de données
- Séquençage de création d'objets
- Enregistrement avec les systèmes de debug
- Gestion d'erreurs pour les échecs de chargement

**Dépendances** :

- Gestion de données
- Factories
- Système de visualisation

**Utilisation** :

```typescript
const { load } = useSceneLoader()
await load(scene)
```

### useStarfield.ts

**Objectif** : Crée et gère le champ d'étoiles d'arrière-plan.

**Fonctionnalités clés** :

- Génération procédurale d'étoiles
- Densité et distribution configurables
- Système de particules optimisé pour les performances
- Gestion appropriée du nettoyage

**Dépendances** : Configuration de scène

**Utilisation** :

```typescript
const { starfield, cleanup } = useStarfield(scene, options)
```

### useTacticalView.ts

**Objectif** : Fournit un accès global à la fonctionnalité de vue tactique.

**Fonctionnalités clés** :

- Gestion d'état global pour la vue tactique
- Système d'enregistrement pour le gestionnaire de caméra
- API simple pour basculer la vue

**Dépendances** : État d'interaction

**Utilisation** :

```typescript
const { isTacticalViewActive, toggleTacticalView } = useTacticalView()
```

### useVisualisation.ts

**Objectif** : Fournit des outils de visualisation de débogage (wireframes, helpers, axes).

**Fonctionnalités clés** :

- Contrôles de visualisation d'objets individuels
- Bascules de visualisation globales
- Gestion des helpers 3JS (AxesHelper, GridHelper)
- Système d'enregistrement pour les objets

**Dépendances** : État de visualisation

**Utilisation** :

```typescript
const { toggleBodyWireframe, toggleGlobalAxes } = useDebugActions()
toggleBodyWireframe('earth')
toggleGlobalAxes()
```

### useZoomManager.ts

**Objectif** : Gère les calculs et l'état du niveau de zoom.

**Fonctionnalités clés** :

- Calcul du niveau de zoom (échelle 0-10)
- État de zoom réactif
- Gestion des seuils de zoom

**Dépendances** : Aucune

**Utilisation** :

```typescript
const { zoomLevel, setZoomLevel } = useZoomManager()
setZoomLevel(5)
```

## Gestion d'état

### cameraState.ts

**Objectif** : État réactif pour la distance et position de caméra.

**Exports** :

- `cameraDistance` (lecture seule)
- `setCameraDistance(distance: number)`

### effectsState.ts

**Objectif** : État pour les effets de post-traitement et la mise en surbrillance d'objets.

**Exports** :

- `outlinedObjects` - Objets à contourner
- `outlineColor` - Couleur de contour actuelle
- `outlineParams` - Paramètres d'effet de contour
- `HOVER_COLOR`, `SELECT_COLOR` - Couleurs prédéfinies

### interactionState.ts

**Objectif** : État pour les interactions utilisateur et objets sélectionnés.

**Exports** :

- `hoveredBody` - Corps céleste actuellement survolé
- `selectedBody` - Corps céleste actuellement sélectionné
- `isCameraFollowing` - État de suivi de caméra
- `isInfoWindowOpen` - Visibilité de la fenêtre d'info
- `isTacticalViewActive` - État de vue tactique

### visualisationState.ts

**Objectif** : État pour les outils de visualisation debug et objets enregistrés.

**Exports** :

- `globalWireframe`, `globalAxes`, `globalGrids` - Bascules globales
- `celestialBodies`, `orbits` - Objets enregistrés
- Propriétés calculées pour l'intégration UI

## Orchestrateur de scène

### useSceneOrchestrator.ts

**Objectif** : Orchestrateur principal legacy en cours d'élimination progressive en faveur de l'architecture modulaire.

**Statut** : Ce fichier contient l'ancienne approche monolithique et est remplacé par les composables plus petits et focalisés décrits ci-dessus.

## Exemples d'utilisation

### Configuration de scène de base

```typescript
// 1. Initialiser les composants 3JS de base
const threeCore = useThreeCore(canvas)

// 2. Configurer le post-traitement
const { composer } = usePostProcessing(threeCore)

// 3. Créer le gestionnaire de caméra
const cameraManager = useCameraManager(threeCore.camera.value, threeCore.controls.value)

// 4. Configurer les interactions
const interactionManager = useInteractionManager(
  threeCore.scene.value,
  threeCore.camera.value,
  threeCore.renderer.value,
  celestialBodies
)

// 5. Charger les données et objets de scène
const { load } = useSceneLoader()
await load(threeCore.scene.value)

// 6. Démarrer la boucle d'animation
const { start } = useAnimationLoop(threeCore, composer, cameraManager)
start()
```

### Ajout de visualisation de debug

```typescript
const { toggleBodyWireframe, registerCelestialBody } = useDebugActions()

// Enregistrer un corps céleste pour le debug
registerCelestialBody('earth', 'Terre', 'Troisième planète du Soleil', earthMesh)

// Basculer le mode wireframe
toggleBodyWireframe('earth')
```

### Gestion des interactions utilisateur

```typescript
// Observer les changements de corps sélectionné
watch(selectedBody, (newBody) => {
  if (newBody) {
    cameraManager.focusOnBody(newBody)
  }
  else {
    cameraManager.resetCamera()
  }
})
```

## Bonnes pratiques

### 1. Gestion des dépendances

- Toujours utiliser le pattern singleton pour les composables lourds en ressources
- Importer seulement ce dont vous avez besoin pour éviter les dépendances circulaires
- Utiliser les imports de types quand possible

### 2. Nettoyage des ressources

- Toujours appeler les méthodes de nettoyage dans `onUnmounted`
- Disposer de manière appropriées objets 3JS
- Effacer les frames d'animation et event listeners

### 3. Gestion d'état

- Utiliser des refs readonly pour un état qui ne devrait pas être modifié à l'extérieur
- Préférer les propriétés calculées pour l'état dérivé
- Garder l'état aussi minimal que possible

### 4. Gestion d'erreurs

- Envelopper les opérations asynchrones dans des blocs try-catch
- Fournir des messages d'erreur significatifs
- Gérer les cas limites avec grâce

### 5. Performance

- Utiliser `shallowRef` pour les objets 3JS
- Éviter l'encapsulation réactive d'objets complexes
- Implémenter des patterns de disposal appropriés
