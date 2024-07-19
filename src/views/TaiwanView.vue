<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import {
  views,
  initMap,
  sumData,
  diffFunc,
  type DiffType,
  type ICityData,
} from '@/composables/taiwan'
import { initChart } from '@/composables/taiwan/chart'
import { type ICsvObj } from '@/composables/taiwan/multiLine'
import MapLayout from '@/layouts/MapLayout.vue'
import Chart from '@/components/MultiLineChart.vue'
import TimelineBar from '@/components/map/TimelineBar.vue'

const years = Array.from({ length: 14 }).map((y, i) => i + 99)
const cntYear = ref(0)
const cntView = ref<DiffType>('POP')
const cntViewIndex = ref(2)
const cntCityData = ref<ICityData>()
const renderCom = ref(true)
const max = 25000
const min = -25000

const forceRender = async () => {
  renderCom.value = false
  await nextTick()
  renderCom.value = true
}

const cityData = computed(() => {
  if (!cntCityData.value?.id) return
  forceRender()
  return Object.values(sumData[cntCityData.value.id]).reduce(
    (acc, cnt) => {
      const d = diffFunc(cntView.value, cnt)
      acc.rows[1].push(d[0])
      acc.rows[2].push(d[1])
      acc.rows[3].push(d[2])
      return acc
    },
    {
      keys: ['year', ...views[cntView.value].cols, views[cntView.value].title],
      rows: [years, [], [], []],
    } as ICsvObj<number>
  )
})

const barChartData = computed(() => {
  const obj: { [year: string]: { code: string; value: number }[] } = {}
  for (const c in sumData) {
    const _city = sumData[c]
    for (const y in _city) {
      const negative =
        (cntView.value !== 'POP' && cntViewIndex.value === 1 && -1) || 1
      const _v = {
        code: c,
        value: diffFunc(cntView.value, _city[y])[cntViewIndex.value] * negative,
      }
      obj[y] ? obj[y].push(_v) : (obj[y] = [_v])
    }
  }
  return obj
})

const dynamicRange = computed(
  () => views[cntView.value].range[cntViewIndex.value]
)
const colorFunc = d3.scaleLinear([min, 0, max], ['blue', 'white', 'orange'])

onMounted(() => {
  const { updateColor, selectCity: mapCity } = initMap(
    (obj) => (cntCityData.value = obj)
  )
  const { updateChart, selectCity: chartCity } = initChart(
    (obj) => (cntCityData.value = obj)
  )

  watch(
    [cntView, cntYear],
    () => {
      const y = years[cntYear.value]
      updateColor(cntView.value, y, colorFunc)
      updateChart(barChartData.value[y], dynamicRange.value)
    },
    { immediate: true }
  )

  watch(cntViewIndex, () => {
    const y = years[cntYear.value]
    updateChart(barChartData.value[y], dynamicRange.value)
  })

  watch(cntCityData, () => {
    if (!cntCityData.value) return
    mapCity(cntCityData.value.name)
    chartCity(cntCityData.value.id)
  })
})
</script>

<template>
  <main class="h-full flex overflow-hidden">
    <MapLayout>
      <div class="flex flex-col gap-4 p-4">
        <div class="w-full flex items-center">
          <h1 class="text-[28px] font-bold">
            全台人口變化圖
            <span class="w-16 inline-block text-center">
              {{ years[cntYear] }}
            </span>
          </h1>
        </div>
        <TimelineBar :periods="years" v-model:value="cntYear" />

        <div class="flex items-center">
          <select
            v-model="cntView"
            class="border border-gray-300 p-2 rounded-lg"
          >
            <option v-for="(v, i) in views" :value="i">{{ v.title }}</option>
          </select>
          <button
            class="ml-auto text-xs py-1.5 px-2 rounded-lg mr-2 bg-gray-100 transition aria-pressed:bg-indigo-500 aria-pressed:text-white"
            :aria-pressed="cntViewIndex === 2"
            @click="() => (cntViewIndex = 2)"
          >
            總覽
          </button>
          <div class="flex rounded-lg overflow-hidden">
            <button
              v-for="(y, i) in views[cntView].cols"
              class="text-xs py-1.5 px-2 bg-gray-100 transition aria-pressed:bg-indigo-500 aria-pressed:text-white"
              :aria-pressed="cntViewIndex === i"
              @click="() => (cntViewIndex = i)"
            >
              {{ y }}
            </button>
          </div>
        </div>

        <Suspense>
          <Chart
            v-for="(v, i) in views"
            title="全台灣"
            :file="`./data/${v.path}.csv`"
            :cnt-year="years[cntYear]"
            :index="3"
            :colors="v.colors"
            :style="{ display: cntView === i ? 'flex' : 'none' }"
            @changeYear="(n:number)=>{cntYear=n; cntView = i}"
          />
        </Suspense>

        <Suspense v-if="renderCom && cntCityData">
          <Chart
            :title="cntCityData.name"
            :file="cityData!"
            :index="3"
            :cnt-year="years[cntYear]"
            :colors="views[cntView].colors"
            @changeYear="(n:number)=>cntYear=n"
          />
        </Suspense>
      </div>

      <!-- MAIN MAP -->
      <svg id="map" class="max-w-full max-h-full m-auto my-6">
        <defs>
          <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop
              offset="0%"
              stop-color="var(--mainColor)"
              stop-opacity="0.2"
            />
            <stop
              offset="100%"
              stop-color="var(--mainColor)"
              stop-opacity="0.01"
            />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="var(--subColor)" stop-opacity="0.2" />
            <stop
              offset="100%"
              stop-color="var(--subColor)"
              stop-opacity="0.01"
            />
          </linearGradient>
          <filter id="shadow" color-interpolation-filters="sRGB">
            <feDropShadow dx="1" dy="3" stdDeviation="3" flood-opacity="0.5" />
          </filter>
        </defs>
      </svg>

      <div class="flex flex-col gap-4 overflow-scroll">
        <div class="w-[350px] h-max rounded-lg p-4 bg-white">
          <h3 class="font-bold text-lg mb-2">各縣市資料</h3>
          <!-- BAR CHART -->
          <svg id="chart"></svg>
        </div>
      </div>
    </MapLayout>
  </main>
</template>
