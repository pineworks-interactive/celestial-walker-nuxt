<script setup lang="ts">
import { computed } from 'vue'
import { colors } from '@/configs/colors.config'

interface Props {
  zoomLevel: number
}

const props = withDefaults(defineProps<Props>(), {
  zoomLevel: 0,
})

const bars = computed(() => [
  { d: 'M0 0H13.1103L40.2351 33H27.1248L0 0Z', visible: true },
  { d: 'M26.2205 0H39.3308L66.4556 33H53.3453L26.2205 0Z', visible: true },
  { d: 'M52.4412 0H65.5515L92.6763 33H79.566L52.4412 0Z', visible: true },
  { d: 'M78.6618 0H91.7721L118.897 33H105.787L78.6618 0Z', visible: true },
  { d: 'M104.883 0H117.993L145.118 33H132.007L104.883 0Z', visible: true },
  { d: 'M131.103 0H144.213L171.338 33H158.228L131.103 0Z', visible: true },
  { d: 'M157.324 0H170.434L197.559 33H184.448L157.324 0Z', visible: true },
  { d: 'M183.544 0H196.655L223.779 33H210.669L183.544 0Z', visible: true },
  { d: 'M209.7645 0H222.8748L249.9996 33H236.8893L209.7645 0Z', visible: true },
  { d: 'M252.5 21.6857L235 1.56164e-05H269.9L252.5 21.6857Z', visible: true },
])

const visibleBarsCount = computed(() => Math.round(props.zoomLevel))
</script>

<template>
  <g transform="translate(11, 2.5)">
    <path
      v-for="(bar, index) in bars"
      :key="index"
      :d="bar.d"
      :fill="colors.springGreen"
      :visibility="index < visibleBarsCount ? 'visible' : 'hidden'"
    />
  </g>
</template>

<style scoped>

</style>
