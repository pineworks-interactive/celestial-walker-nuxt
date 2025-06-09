<script setup lang="ts">
defineProps<{ label: string, modelValue: boolean }>()
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="flex w-full cursor-pointer items-center justify-between text-white">
    <span class="text-sm font-medium">{{ label }}</span>
    <input
      type="checkbox"
      :checked="modelValue"
      class="form-checkbox h-4 w-4 rounded border-gray-600 bg-gray-800 text-green-400 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
  </label>
</template>
