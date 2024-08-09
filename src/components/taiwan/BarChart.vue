<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { initChart, margin } from '@/composables/taiwan/chart'

const props = defineProps<{
  data: Record<string, number>
  range: [number, number]
  cityList: string[]
  cntCity?: string
}>()

const el = ref<HTMLElement>()
const emit = defineEmits(['changeCity'])
onMounted(() => {
  if (!el.value) return
  const { updateRange, updateChart, selectCity } = initChart(
    el.value,
    props.cityList,
    (n: string) => emit('changeCity', n)
  )

  updateRange(props.range)
  updateChart(props.data)

  watch(
    () => props.range,
    () => {
      updateRange(props.range)
      updateChart(props.data)
    }
  )
  watch(
    () => props.data,
    () => {
      updateChart(props.data)
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
  <svg ref="el" stroke-linejoin="round" font-size="1rem" width="100%">
    <g
      class="contentWrap"
      :transform="`translate(${margin.left},${margin.top})`"
    >
      <g class="barsGroup"></g>
      <g class="textGroup"></g>
      <g class="labelGroup"></g>
      <g class="valueGroup" text-anchor="end"></g>
      <line stroke="var(--gray-300)" stroke-dasharray="4 3" :y1="0" />
    </g>
  </svg>
</template>
