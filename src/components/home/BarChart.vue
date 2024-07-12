<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { initBarChart, margin } from '@/composables/home/barchart'
const props = defineProps<{
  data: Record<string, number>
}>()

const el = ref<HTMLElement>()
onMounted(() => {
  if (!el.value) return

  const { updateChart } = initBarChart(el.value)
  watch(
    () => props.data,
    () => {
      updateChart(props.data)
    },
    {
      immediate: true,
    }
  )
})
</script>

<template>
  <svg ref="el" stroke-linejoin="round" font-size="0.75rem">
    <g class="contentGroup" :transform="`translate(${margin.left},${margin.top})`">
      <g class="rectGroup"></g>
      <g class="textGroup"></g>
      <g class="valueGroup" text-anchor="end"></g>
      <line stroke="lightGray" stroke-dasharray="4 3" :y1="0" />
    </g>
  </svg>
</template>
