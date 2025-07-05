/**
 * @module useSolarSystemData
 * @description This module provides a reactive and reusable way to fetch and manage the
 * solar system data from a JSON file. It encapsulates the loading, error handling,
 * and state management for the data, making it easily accessible throughout the application
 */
import type { SolarSystemData } from '@/types/solarSystem.types'
import { ref } from 'vue'

// ~ --- Module-level reactive state ---
/**
 * @private
 * @type {ref<SolarSystemData | null>}
 * A reactive reference to hold the parsed solar system data
 * It is initialized to null and populated once the data is fetched
 */
const data = ref<SolarSystemData | null>(null)
/**
 * @private
 * @type {ref<boolean>}
 * A flag to indicate whether the data is currently being loaded
 */
const loading = ref(false)
/**
 * @private
 * @type {ref<Error | null>}
 * A reactive reference to store any error that occurs during data fetching
 */
const error = ref<Error | null>(null)

/**
 * # A composable function for fetching and managing solar system data
 * It returns the reactive state and a function to trigger the data loading process
 *
 * @returns {object} An object containing:
 * - `data`: A reactive reference to the loaded solar system data
 * - `loading`: A reactive boolean indicating the loading state
 * - `error`: A reactive reference to any potential error
 * - `loadData`: An async function to initiate the data fetching
 */
export function useSolarSystemData() {
  /**
   * ~ Fetches and parses the solar system data from the `/data/solar_system_data.json` file
   * It updates the loading and error states accordingly
   *
   * @returns {Promise<void>} A promise that resolves when the data has been successfully loaded or an error has occurred
   */
  const loadData = async (): Promise<void> => {
    // * Set loading to true and clear any previous errors
    loading.value = true
    error.value = null

    try {
      // * Fetch the data from the public directory
      const response = await fetch('/data/solar_system_data.json')

      // * Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to load solar system data: ${response.statusText}`)
      }

      // * Parse the JSON response and update the data state
      const jsonData = await response.json()
      data.value = jsonData as SolarSystemData
    }
    catch (e) {
      // * If an error occurs, store it in the error state
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('Error loading solar system data:', e)
    }
    finally {
      // * Ensure loading is set to false once the process is complete
      loading.value = false
    }
  }

  // * Expose the reactive state and the load function
  return {
    data,
    loading,
    error,
    loadData,
  }
}
