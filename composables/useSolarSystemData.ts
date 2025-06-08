import type { SolarSystemData } from '@/types/solarSystem.types'
import { ref } from 'vue'

export function useSolarSystemData() {
  const data = ref<SolarSystemData | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * ? Fetches and parses the solar system data from the JSON file
   * @returns Promise that resolves when data is loaded
   */
  const loadData = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/data/solar_system_data.json')

      if (!response.ok) {
        throw new Error(`Failed to load solar system data: ${response.statusText}`)
      }

      const jsonData = await response.json()
      data.value = jsonData as SolarSystemData
    }
    catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      console.error('Error loading solar system data:', e)
    }
    finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    loadData,
  }
}
