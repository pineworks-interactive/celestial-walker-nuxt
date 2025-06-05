<script setup lang="ts">
interface Props {
  x?: number
  y?: number
  width?: number
  height?: number
  buttonId?: string
  buttonColor?: string
  text?: string
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  x: 0,
  y: 0,
  width: 40.815674,
  height: 421.05862,
  buttonId: 'overlay-menu-button',
  buttonColor: '#00FF7F',
  text: 'menu',
  textColor: '#000000',
})

const emit = defineEmits(['click'])

function handleClick(event: MouseEvent) {
  emit('click', event)
}

// svg button viewbox
const internalViewBox = '0 0 10.799147 111.40509'

// position correctly in the svg
const groupTransform = 'translate(-11.077035,-20.992441)'
const pathTransform = 'matrix(0.99666563,0,0,0.99473473,0.75899257,0.75422132)'
const textTransform = 'matrix(0,0.99569972,-0.99569972,0,0.75899257,0.75422132)'

// original text position
const textX = 63.441742
const textY = -13.297102
</script>

<template>
  <svg
    :id="props.buttonId"
    :x="props.x"
    :y="props.y"
    :width="props.width"
    :height="props.height"
    :viewBox="internalViewBox"
    preserveAspectRatio="xMidYMid meet"
    style="cursor: pointer; pointer-events: auto;"
    @click="handleClick"
  >
    <g :transform="groupTransform">
      <path
        id="overlay-menu-button-shape"
        :fill="props.buttonColor"
        :fill-opacity="0.9"
        :stroke="props.buttonColor"
        :stroke-width="0.4"
        stroke-linecap="round"
        :stroke-opacity="1"
        d="m 10.89975,29.498694 9.916078,-8.353533 V 121.23451 l -10.089706,10.19904 z"
        :transform="pathTransform"
      />
      <text
        id="overlay-menu-button-text"
        xml:space="preserve"
        :x="textX"
        :y="textY"
        :transform="textTransform"
        font-weight="bold"
        font-size="10px"
        font-family="NEOTERIC"
        letter-spacing="5.31452px"
        writing-mode="horizontal-tb"
        direction="ltr"
        text-anchor="start"
        :fill="props.textColor"
        :fill-opacity="1"
        stroke="none"
      >
        <tspan
          id="overlay-menu-button-text-tspan"
          :fill="props.textColor"
          stroke="none"
          :x="textX"
          :y="textY"
          rotate="270 270 270 270 0"
        >
          {{ props.text }}
        </tspan>
      </text>
    </g>
  </svg>
</template>

<style scoped>

</style>
