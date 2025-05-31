<script setup lang="ts">
import type { ButtonProps } from '@/types/ui.types'

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'outline',
  color: 'primary',
  size: 'md',
  trailing: false,
  disabled: false,
})

const buttonUI = {
  base: 'transition-all duration-300 ease-in-out custom-button-hover',
}
</script>

<template>
  <UButton
    :to="props.to"
    variant="outline"
    :color="props.color"
    :size="props.size"
    :icon="props.icon"
    :trailing="props.trailing"
    :disabled="props.disabled"
    :ui="buttonUI"
    :data-color="props.color"
  >
    {{ props.label }}
  </UButton>
</template>

<style scoped>
</style>
