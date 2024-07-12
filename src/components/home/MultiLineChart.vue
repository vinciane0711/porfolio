<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { conf, initChart, formatter } from '@/composables/home/multiLine'
import { numWithCommas } from '@/composables'

const props = defineProps<{
  head: string[]
  data: string[][]
  index: number
  legends: string[]
  dataSum?: number[]
}>()
const el = ref<HTMLElement>()
const hoverIndex = ref<number | undefined>(undefined)

const { drawDetail, values, palette } = initChart(props.head, props.data, props.dataSum)
const emit = defineEmits(['changeYear'])
const title = ref('折線圖')

onMounted(() => {
  if (!el.value) return
  const { updateFocus } = drawDetail(el.value, (n: number) => emit('changeYear', n))

  watch(
    () => props.index,
    () => {
      updateFocus(props.index)
    },
    {
      immediate: true,
    }
  )
})
</script>

<template>
  <div class="p-4 rounded-lg flex gap-4 flex-col w-[400px] border transition bg-white border-gray-300">
    <div class="flex items-center">
      <input class="font-bold text-lg" type="text" v-model="title" />
    </div>

    <svg ref="el" :viewBox="`0, 0, ${conf.w}, ${conf.h}`">
      <g class="x-axis" :transform="`translate(0,${conf.h - conf.mb})`" />
      <g class="y-axis1" :transform="`translate(${conf.mx},0)`" />
      <g class="y-axis2" :transform="`translate(${conf.w - conf.mx},0)`" />
      <g class="multi-lines" stroke-width="2">
        <path
          v-for="(p, i) in values"
          fill="none"
          :stroke="palette[i]"
          class="transition"
          :class="hoverIndex !== undefined && (hoverIndex === i ? 'opacity-100' : 'opacity-10')"
        />
      </g>

      <line class="line" stroke="lightGray" stroke-width="1.5" :y1="conf.h - conf.mb" :y2="conf.mt" opacity="0" />
      <rect
        class="overlay cursor-[ew-resize]"
        opacity="0"
        :x="conf.mx"
        :y="conf.mt"
        :width="conf.w - conf.mx * 2"
        :height="conf.h - conf.mb - conf.mt"
      />

      <g class="focus" opacity="0.75" :transform="`translate(${conf.mx},0)`">
        <line
          class="line"
          stroke="lightGray"
          stroke-width="1.5"
          stroke-dasharray="3 2"
          :y1="conf.h - conf.mb"
          :y2="conf.mt"
        />

        <circle
          v-for="(p, i) in values"
          :fill="palette[i] || 'lightGray'"
          r="4"
          stroke-width="1.5"
          stroke="white"
          class="transition"
          :class="hoverIndex !== undefined && (hoverIndex === i ? 'opacity-100' : 'opacity-0')"
        />
      </g>
    </svg>

    <!-- legends & cntValues -->
    <ul class="grid grid-flow-row grid-cols-4 gap-2 text-sm group" @mouseleave="() => (hoverIndex = undefined)">
      <li
        v-for="(r, i) in values"
        class="group-hover:opacity-30 transition hover:!opacity-100 cursor-default"
        @mouseenter="() => (hoverIndex = i)"
      >
        <div class="flex items-center justify-center text-xs">
          <span class="w-2 h-2 rounded-full mr-2" :style="{ background: palette[i] || 'lightGray' }" />
          <!-- :contenteditable="true" -->
          <p>{{ [...legends, dataSum && '平均'][i] }}</p>
        </div>
        <p class="text-center font-bold">
          {{ formatter(r[index]) }}
          <!-- {{ numWithCommas(r[index], true) }} -->
        </p>
      </li>
    </ul>
  </div>
</template>
