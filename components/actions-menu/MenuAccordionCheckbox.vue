<script setup lang="ts">
defineProps<{
  label: string
  modelValue: boolean
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <button
    class="flex w-full cursor-pointer items-center justify-between text-left"
    @click="$emit('update:modelValue')"
  >
    <span class="text-sm font-medium text-white">{{ label }}</span>
    <div
      class="flex h-4 w-4 items-center justify-center rounded border border-gray-600 bg-gray-800"
    >
      <div
        v-if="modelValue"
        class="h-2 w-2 rounded-sm bg-green-400"
      />
    </div>
  </button>
</template>
