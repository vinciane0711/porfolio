<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { initMap } from '@/composables/taiwan'
const props = defineProps<{
  data: Record<string, number>
  range: [number, number]
  cntCity?: string
}>()

const el = ref<HTMLElement>()
const emit = defineEmits(['changeCity'])
onMounted(() => {
  if (!el.value) return
  const { updateRange, updateColor, selectCity } = initMap(
    el.value,
    (n: string) => emit('changeCity', n)
  )

  updateRange(props.range)
  updateColor(props.data)

  watch(
    () => props.range,
    () => {
      updateRange(props.range)
      updateColor(props.data)
    }
  )
  watch(
    () => props.data,
    () => {
      updateColor(props.data)
    }
  )
  watch(
    () => props.cntCity,
    () => {
      if (!props.cntCity) return
      selectCity(props.cntCity)
    }
  )
})
</script>

<template>
  <svg ref="el" stroke-linejoin="round">
    <defs>
      <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="var(--mainColor)" stop-opacity="0.2" />
        <stop offset="100%" stop-color="var(--mainColor)" stop-opacity="0.01" />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" x2="0%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="var(--subColor)" stop-opacity="0.2" />
        <stop offset="100%" stop-color="var(--subColor)" stop-opacity="0.01" />
      </linearGradient>
      <filter id="shadow" color-interpolation-filters="sRGB">
        <feDropShadow dx="1" dy="3" stdDeviation="3" flood-opacity="0.5" />
      </filter>
    </defs>
  </svg>
</template>
