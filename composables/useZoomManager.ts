import { readonly, ref } from 'vue'

const zoomLevel = ref(0)

/**
 * # Composable for managing and providing access to the scene's zoom level.
 * @returns An object with the current zoom level.
 */
export function useZoomManager() {
  /**
   * Method to set the zoom level.
   * @param level - The new zoom level (0-10).
   */
  const setZoomLevel = (level: number) => {
    zoomLevel.value = Math.max(0, Math.min(10, level))
  }

  return {
    // ? 0 = fully zoomed out, 10 = fully zoomed in.
    zoomLevel: readonly(zoomLevel),
    setZoomLevel,
  }
}
