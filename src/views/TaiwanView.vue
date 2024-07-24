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
const cntYearIndex = ref(0)
const cntYear = computed(() => years[cntYearIndex.value])
const cntView = ref<DiffType>('POP')
const cntViewIndex = ref(2)
const cntCityData = ref('')
const renderCom = ref(true)

const forceRender = async () => {
  renderCom.value = false
  await nextTick()
  renderCom.value = true
}

const cityData = computed(() => {
  if (!cntCityData.value) return
  forceRender()
  const rows = [years, [], [], []]

  Object.values(sumData).forEach((yearData) => {
    const city = yearData.find((c) => c.city === cntCityData.value)!
    const d = diffFunc(cntView.value, city)
    rows[1].push(d[0])
    rows[2].push(Math.abs(d[1]))
    rows[3].push(d[2])
  })

  return {
    keys: ['year', ...views[cntView.value].cols, views[cntView.value].title],
    rows,
  } as ICsvObj<number>
})

const barChartData = computed(() => {
  return Object.keys(sumData).reduce(
    (acc: { [year: string]: { [city: string]: number } }, year) => {
      acc[year] = sumData[year].reduce((a, c) => {
        a[c.city] = diffFunc(cntView.value, c)[cntViewIndex.value]
        return a
      }, {} as { [city: string]: number })
      return acc
    },
    {}
  )[cntYear.value]
})

const dynamicRange = computed(
  () => views[cntView.value].range[cntViewIndex.value]
)

onMounted(() => {
  const { updateColor, selectCity: mapCity } = initMap(
    (obj) => (cntCityData.value = obj)
  )
  const {
    updateRange,
    updateChart,
    selectCity: chartCity,
  } = initChart((obj) => (cntCityData.value = obj))

  watch(
    [cntView, cntViewIndex],
    () => {
      updateRange(dynamicRange.value)
      updateChart(barChartData.value)
      updateColor(barChartData.value)
    },
    { immediate: true }
  )

  watch(cntYear, () => {
    updateColor(barChartData.value)
    updateChart(barChartData.value)
  })

  watch(cntCityData, () => {
    if (!cntCityData.value) return
    mapCity(cntCityData.value)
    chartCity(cntCityData.value)
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
              {{ cntYear }}
            </span>
          </h1>
        </div>
        <TimelineBar :periods="years" v-model:value="cntYearIndex" />

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
            :cntYear="cntYear"
            :index="3"
            :viewIndex="cntViewIndex"
            :colors="v.colors"
            :style="{ display: cntView === i ? 'flex' : 'none' }"
            @changeYear="(n:number)=>cntYearIndex=n"
          />
        </Suspense>
        <Suspense v-if="renderCom && cntCityData">
          <Chart
            :title="cntCityData"
            :file="cityData!"
            :index="3"
            :cntYear="cntYear"
            :viewIndex="cntViewIndex"
            :colors="views[cntView].colors"
            @changeYear="(n:number)=>cntYearIndex=n"
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

      <div
        class="flex flex-col gap-4 overflow-y-scroll p-4 min-w-[350px] border border-l-gray-300"
      >
        <h3 class="font-bold text-lg">各縣市資料</h3>
        <!-- BAR CHART -->
        <svg id="chart"></svg>
      </div>
    </MapLayout>
  </main>
</template>
