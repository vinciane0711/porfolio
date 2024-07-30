<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  conf,
  initChart,
  csvConvertor,
  type ICsvObj,
} from '@/composables/taiwan/multiLine'
import { numWithCommas } from '@/composables'

const props = defineProps<{
  title: string
  file: string | ICsvObj<number>
  cntYear: number
  viewIndex: number
}>()
const el = ref<HTMLElement>()
const palette = ['var(--mainColor)', 'var(--subColor)', 'lightGray']
const data =
  typeof props.file === 'string' ? await csvConvertor(props.file) : props.file

const {
  keys,
  years,
  rest,
  rate,
  total,
  line,
  line2,
  area,
  transposeFunc,
  drawDetail,
} = initChart(data)
const yearIndex = computed(() => years.findIndex((i) => i === props.cntYear))
const emit = defineEmits(['changeYear', 'changeViewIndex', 'openTable'])

onMounted(() => {
  if (!el.value) return
  const { updateFocus } = drawDetail(el.value, (n: number) =>
    emit('changeYear', n)
  )
  updateFocus(yearIndex.value)

  watch(
    () => props.cntYear,
    () => {
      updateFocus(yearIndex.value)
    }
  )
})
</script>

<template>
  <div
    class="p-4 rounded-lg flex gap-2 flex-col w-[400px] border transition bg-white border-gray-300"
  >
    <div class="flex items-center">
      <h3 class="font-bold text-lg">
        {{ title }}
        <span class="text-sm ml-2">{{ numWithCommas(total[yearIndex]) }}</span>
      </h3>
      <span
        class="icon-[mdi--table] text-xl ml-auto text-gray-500 hover:text-gray-700 cursor-pointer"
        @click="emit('openTable', data)"
      ></span>
    </div>

    <svg ref="el" :viewBox="`0, 0, ${conf.w}, ${conf.h}`">
      <g class="x-axis" :transform="`translate(0,${conf.h - conf.mb})`" />
      <g class="y-axis1" :transform="`translate(${conf.mx},0)`" />
      <g class="y-axis2" :transform="`translate(${conf.w - conf.mx},0)`" />
      <g class="multi-lines" stroke-width="2">
        <path
          fill="none"
          :stroke="palette[2]"
          stroke-dasharray="4 3"
          :d="`${line2(transposeFunc(rate))}`"
        />
        <path
          v-for="(r, i) in rest"
          fill="none"
          :stroke="palette[i]"
          :opacity="viewIndex !== i ? 0.3 : 1"
          :d="`${line(transposeFunc(r))}`"
        />

        <path
          v-for="(r, i) in rest"
          :fill="`url(#grad${[i + 1]})`"
          :opacity="viewIndex !== i ? 0.3 : 1"
          :d="`${area(transposeFunc(r))}`"
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
          v-for="(l, i) in keys.length + 1"
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
        v-for="(l, i) in [...keys, '增加率']"
        class="cursor-pointer"
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
          {{ numWithCommas([...rest, rate][i][yearIndex]) }}
        </p>
      </div>
    </div>
  </div>
</template>
