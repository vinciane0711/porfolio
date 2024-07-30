<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
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
import { onClickOutside } from '@vueuse/core'
import { numWithCommas } from '@/composables'

const years = Array.from({ length: 14 }).map((y, i) => i + 99)
const cntYearIndex = ref(0)
const cntYear = computed(() => years[cntYearIndex.value])
const cntView = ref<DiffType>('POP')
const cntViewIndex = ref(2)
const cntCityName = ref('')
const renderCom = ref(true)
const tableData = ref<ICsvObj<number>>()

const modal = ref(false)
const modalRef = ref(null)

onClickOutside(modalRef, (event) => {
  console.log(event)
  modal.value = false
})

const forceRender = async () => {
  renderCom.value = false
  await nextTick()
  renderCom.value = true
}

const cityPeriodsData = computed(() => {
  if (!cntCityName.value) return
  forceRender()
  const rows: number[][] = [[], [], [], []]
  Object.values(sumData).forEach((yearData) => {
    const city = yearData.find((c) => c.city === cntCityName.value)!
    const d = diffFunc(cntView.value, city)
    rows[0].push(d[0])
    rows[1].push(Math.abs(d[1]))
    rows[2].push(d[2])
    rows[3].push(d[3])
  })

  return {
    keys: ['年分', ...views[cntView.value].cols, '增加數', '增加率'],
    rows: [years, ...rows],
  } as ICsvObj<number>
})

const cntCityData = computed(() => {
  return Object.keys(sumData).reduce(
    (acc: { [year: string]: { [city: string]: number } }, year) => {
      acc[year] = sumData[year].reduce((a, c) => {
        a[c.city] = diffFunc(cntView.value, c)[cntViewIndex.value]
        return a
      }, {} as { [city: string]: number })
      return acc
    },
    {}
  )
})

const dynamicRange = computed(
  () => views[cntView.value].range[cntViewIndex.value]
)

const openTable = (data: ICsvObj<number>) => {
  tableData.value = data
  modal.value = true
}

onMounted(() => {
  const {
    updateMapRange,
    updateColor,
    selectCity: mapCity,
  } = initMap((name) => (cntCityName.value = name))
  const {
    updateRange,
    updateChart,
    selectCity: barChartCity,
  } = initChart((name) => (cntCityName.value = name))

  watch(
    [cntView, cntViewIndex],
    () => {
      updateRange(dynamicRange.value)
      updateMapRange(dynamicRange.value)
      updateChart(cntCityData.value[cntYear.value])
      updateColor(cntCityData.value[cntYear.value])
    },
    { immediate: true }
  )

  watch(cntYear, () => {
    updateColor(cntCityData.value[cntYear.value])
    updateChart(cntCityData.value[cntYear.value])
  })

  watch(cntCityName, () => {
    if (!cntCityName.value) return
    mapCity(cntCityName.value)
    barChartCity(cntCityName.value)
  })
})
</script>

<template>
  <MapLayout>
    <div class="flex flex-col gap-4">
      <div class="w-full flex items-center">
        <h1 class="text-[28px] font-bold">
          全台人口變化
          <span class="w-16 inline-block text-center">
            {{ cntYear }}
          </span>
        </h1>
      </div>
      <TimelineBar :periods="years" v-model:value="cntYearIndex" />

      <div class="flex items-center">
        <select
          v-model="cntView"
          class="border border-gray-300 p-1 text-sm rounded-lg"
        >
          <option v-for="(v, i) in views" :value="i">{{ v.title }}</option>
        </select>

        <div class="ml-auto flex gap-0.5 rounded-lg overflow-hidden">
          <button
            v-for="(y, i) in [...views[cntView].cols, '總覽']"
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
          :viewIndex="cntViewIndex"
          :style="{ display: cntView === i ? 'flex' : 'none' }"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
          @openTable="openTable"
        />
      </Suspense>
      <Suspense v-if="renderCom && cntCityName">
        <Chart
          :title="cntCityName"
          :file="cityPeriodsData!"
          :cntYear="cntYear"
          :viewIndex="cntViewIndex"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
          @openTable="openTable"
        />
      </Suspense>
    </div>

    <!-- MAIN MAP -->
    <svg id="map" class="max-w-full max-h-[80%] m-auto">
      <defs>
        <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="var(--mainColor)" stop-opacity="0.2" />
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
      class="flex flex-col my-auto p-4 min-w-[350px] border border-l-gray-300 h-max max-h-full rounded-md"
    >
      <h3 class="font-bold text-lg">各縣市資料</h3>
      <!-- BAR CHART -->
      <div class="w-max max-h-max h-full overflow-y-scroll">
        <svg id="chart"></svg>
      </div>
    </div>
  </MapLayout>

  <div
    v-if="modal"
    ref="modalRef"
    class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[3/4] z-10"
  >
    <div class="bg-white p-4 border border-gray-30 rounded-md shadow-md">
      <button class="absolute top-2 right-2" @click="modal = false">𝖷</button>
      <table v-if="tableData" class="text-xs [*_td]:p-0.5">
        <colgroup>
          <col />
          <col v-for="y in years" :class="y === cntYear && 'bg-gray-100'" />
        </colgroup>
        <tr v-for="(r, i) in tableData.rows">
          <td>{{ tableData.keys[i] }}</td>
          <td
            v-for="(v, j) in r"
            :style="{
              color: v < 0 ? 'red' : 'current',
            }"
            @click="cntYearIndex = j"
          >
            {{ numWithCommas(v) }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
