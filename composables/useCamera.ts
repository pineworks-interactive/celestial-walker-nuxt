import { readonly, ref } from 'vue'

const cameraDistance = ref(0)

export function useCamera() {
  const setCameraDistance = (distance: number) => {
    cameraDistance.value = distance
  }

  return {
    cameraDistance: readonly(cameraDistance),
    setCameraDistance,
  }
}
