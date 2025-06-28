<script setup lang="ts">
import { ref } from 'vue'
import MenuAccordionCheckbox from '@/components/actions-menu/MenuAccordionCheckbox.vue'
import { useDebugActions } from '@/composables/useVisualisation'
import { orbitsForUI } from '@/composables/visualisationState'

const {
  toggleOrbitAxisHelper,
  toggleOrbitGridHelper,
} = useDebugActions()

// ~ --- Reactive state ---
const openItemId = ref<string | null>(null)

// ~ --- Functions ---
function toggleItem(id: string) {
  openItemId.value = openItemId.value === id ? null : id
}
</script>

<template>
  <div class="w-full">
    <div
      v-for="orbit in orbitsForUI"
      :key="orbit.id"
      class="border-b border-gray-700"
    >
      <button
        class="flex w-full items-center justify-between p-3 text-left text-white"
        @click="toggleItem(orbit.id)"
      >
        <span class="truncate text-base font-medium">{{ orbit.name }}</span>
        <svg
          class="h-5 w-5 transform transition-transform duration-200"
          :class="{ 'rotate-180': openItemId === orbit.id }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div v-if="openItemId === orbit.id" class="flex flex-col gap-3 p-4">
        <MenuAccordionCheckbox
          :model-value="orbit.hasAxesHelpers"
          label="Axes Helper"
          @update:model-value="() => toggleOrbitAxisHelper(orbit.id)"
        />
        <MenuAccordionCheckbox
          :model-value="orbit.hasGridHelpers"
          label="Grid Helper"
          @update:model-value="() => toggleOrbitGridHelper(orbit.id)"
        />
      </div>
    </div>
  </div>
</template>
