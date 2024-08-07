<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { conf, initChart } from '@/composables/taiwan/multiLine'
import { type ICsvObj } from '@/composables/taiwan'
import { numWithCommas } from '@/composables'

const props = defineProps<{
  years: number[]
  title: string
  file: ICsvObj
  yearIndex: number
  viewIndex: number
}>()
const el = ref<HTMLElement>()
const palette = ['var(--mainColor)', 'var(--subColor)', 'var(--gray-500)']
const emit = defineEmits(['changeYear', 'changeViewIndex', 'openTable'])

const data = computed(() => {
  const [year, row1k, row2k, ...r] = props.file.keys
  const [years, row1, row2, total, rate] = props.file.rows
  return {
    keys: [row1k, row2k, '增加率 (數)'],
    rest: [row1, row2],
    rate,
    total,
  }
})

onMounted(() => {
  if (!el.value) return
  const { updateYAxis, updateFocus } = initChart(
    el.value,
    props.years,
    (n: number) => emit('changeYear', n)
  )

  watch(
    () => props.file,
    () => {
      updateYAxis(data.value.rest, data.value.rate)
    },
    { immediate: true }
  )

  watch(
    () => [props.file, props.yearIndex],
    () => {
      const arr = [...data.value.rest, data.value.rate].map(
        (d) => d[props.yearIndex]
      )
      updateFocus(props.years[props.yearIndex], arr)
    },
    { immediate: true }
  )
})
</script>

<template>
  <div class="basicWrap w-full sm:w-[400px] overflow-hidden">
    <div class="flex items-center">
      <h3>{{ title }}</h3>
      <span
        class="icon-[mdi--table] text-xl ml-auto text-gray-500 hover:text-gray-700 cursor-pointer"
        @click="emit('openTable', title, file)"
      />
    </div>

    <svg ref="el" :viewBox="`0, 0, ${conf.w}, ${conf.h}`" class="w-full">
      <g class="x-axis" :transform="`translate(0,${conf.h - conf.mb})`" />
      <g class="y-axis1" :transform="`translate(${conf.mx},0)`" />
      <g class="y-axis2" :transform="`translate(${conf.w - conf.mx},0)`" />
      <g class="multi-lines" stroke-width="2">
        <path
          class="rate-line"
          fill="none"
          :stroke="palette[2]"
          stroke-dasharray="4 3"
          :opacity="viewIndex !== 2 ? 0.5 : 1"
        />
        <path
          class="rest-line"
          v-for="(r, i) in data.rest"
          fill="none"
          :stroke="palette[i]"
          :opacity="viewIndex !== i ? 0.3 : 1"
        />

        <path
          class="rest-bg"
          v-for="(r, i) in data.rest"
          :fill="`url(#grad${[i + 1]})`"
          :opacity="viewIndex !== i ? 0.3 : 1"
        />
      </g>

      <line
        class="line"
        stroke="lightGray"
        stroke-width="1.5"
        :y1="conf.h - conf.mb"
        :y2="conf.mt"
        opacity="0"
      />
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
          :y1="conf.h - conf.mb"
          :y2="conf.mt"
        />
        <circle
          v-for="(l, i) in data.keys.length"
          r="4"
          :fill="palette[i]"
          stroke="white"
          stroke-width="1.5"
        />
      </g>
    </svg>

    <!-- legends & cntValues -->
    <div class="grid grid-cols-3 gap-2 text-sm px-4">
      <div
        v-for="(l, i) in data.keys"
        class="cursor-pointer py-1 rounded-md transition-colors hover:bg-gray-100"
        @click="emit('changeViewIndex', i)"
      >
        <div class="flex items-center justify-center text-xs">
          <span
            class="w-2 h-2 rounded-full mr-2"
            :style="{ background: palette[i] }"
          />
          <p>{{ l }}</p>
        </div>
        <p class="text-center font-bold">
          {{ numWithCommas([...data.rest, data.rate][i][yearIndex]) }}
          <span v-if="i === 2" class="font-normal">
            ({{ numWithCommas(data.total[yearIndex]) }})
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
