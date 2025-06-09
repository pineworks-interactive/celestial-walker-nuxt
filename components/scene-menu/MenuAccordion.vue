<script setup lang="ts">
import { ref } from 'vue'
import MenuAccordionCheckbox from '@/components/scene-menu/MenuAccordionCheckbox.vue'
import { useDebugControls } from '@/composables/useDebugControls'

const {
  celestialBodies,
  toggleBodyWireframe,
  toggleBodyAxisHelper,
  toggleBodyGridHelper,
} = useDebugControls()

// simple ref to track currently open accordion item id
const openItemId = ref<string | null>(null)

/**
 * ? Toggles an accordion item open or closed.
 * @param id The ID of the celestial body to toggle.
 */
function toggleItem(id: string) {
  openItemId.value = openItemId.value === id ? null : id
}
</script>

<template>
  <div class="w-full">
    <div
      v-for="body in celestialBodies"
      :key="body.id"
      class="border-b border-gray-700"
    >
      <button
        class="flex w-full items-center justify-between p-3 text-left text-white"
        @click="toggleItem(body.id)"
      >
        <span class="truncate text-base font-medium">{{ body.name }}</span>
        <svg
          class="h-5 w-5 transform transition-transform duration-200"
          :class="{ 'rotate-180': openItemId === body.id }"
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

      <!-- * Content panel (shown || hidden) -->
      <div v-if="openItemId === body.id" class="flex flex-col gap-3 p-4">
        <MenuAccordionCheckbox
          :model-value="body.isWireframe"
          label="Wireframe"
          @update:model-value="toggleBodyWireframe(body.id)"
        />
        <MenuAccordionCheckbox
          :model-value="body.hasAxesHelpers"
          label="Axes Helper"
          @update:model-value="toggleBodyAxisHelper(body.id)"
        />
        <MenuAccordionCheckbox
          :model-value="body.hasGridHelpers"
          label="Grid Helper"
          @update:model-value="toggleBodyGridHelper(body.id)"
        />
      </div>
    </div>
  </div>
</template>
