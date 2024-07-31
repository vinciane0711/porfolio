<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import {
  views,
  initMap,
  sumData,
  taiwanData,
  diffFunc,
  type DiffType,
  type ICsvObj,
} from '@/composables/taiwan'
import { initChart } from '@/composables/taiwan/chart'
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
const tableData = ref<{
  name: string
  table: ICsvObj<number> | undefined
}>({
  name: '',
  table: undefined,
})

const modal = ref(false)
const modalRef = ref(null)
onClickOutside(modalRef, (e) => {
  modal.value = false
})

const cityPeriodsData = computed(() => {
  if (!cntCityName.value) return
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

const openTable = (name: string, data: ICsvObj<number>) => {
  tableData.value = { name, table: data }
  modal.value = true
}

const changeCity = (name: string) => (cntCityName.value = name)

onMounted(() => {
  const {
    updateMapRange,
    updateColor,
    selectCity: mapCity,
  } = initMap(changeCity)
  const {
    updateRange,
    updateChart,
    selectCity: barChartCity,
  } = initChart(changeCity)

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

      <Chart
        title="全台灣"
        :years="years"
        :file="taiwanData[cntView]"
        :yearIndex="cntYearIndex"
        :viewIndex="cntViewIndex"
        @changeYear="(n:number)=>cntYearIndex=n"
        @changeViewIndex="(n:number)=>cntViewIndex=n"
        @openTable="openTable"
      />

      <Chart
        v-if="cityPeriodsData"
        :years="years"
        :title="cntCityName"
        :file="cityPeriodsData!"
        :yearIndex="cntYearIndex"
        :viewIndex="cntViewIndex"
        @changeYear="(n:number)=>cntYearIndex=n"
        @changeViewIndex="(n:number)=>cntViewIndex=n"
        @openTable="openTable"
      />
      <div
        v-else
        class="p-4 rounded-lg flex gap-2 flex-col w-[400px] border transition bg-white border-gray-300"
      >
        <p>選擇城市</p>

        <div class="grid grid-cols-3 gap-2 m-auto">
          <button
            class="border border-gray-300 text-sm px-2 py-1 rounded-md"
            v-for="city in [
              '臺北市',
              '新北市',
              '桃園市',
              '臺中市',
              '臺南市',
              '高雄市',
            ]"
            @click="changeCity(city)"
          >
            {{ city }}
          </button>
        </div>
      </div>
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
    class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[80%] z-10"
  >
    <div
      class="bg-white p-4 border border-gray-30 rounded-md shadow-md flex flex-col gap-2"
    >
      <button class="absolute top-2 right-2 flex" @click="modal = false">
        <span
          class="icon-[mdi--close] text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
        />
      </button>
      <template v-if="tableData">
        <h4 class="text-center">
          {{ tableData.name }} {{ views[cntView].title }}
        </h4>
        <div class="w-full overflow-x-auto">
          <table v-if="tableData.table" class="text-xs [*_td]:p-0.5 rounded-md">
            <colgroup>
              <col />
              <col v-for="y in years" :class="y === cntYear && 'bg-gray-100'" />
            </colgroup>
            <tr v-for="(r, i) in tableData.table.rows">
              <td>{{ tableData.table.keys[i] }}</td>
              <td
                v-for="(v, j) in r"
                :style="{
                  color: v < 0 ? 'red' : 'current',
                  textAlign: i === 0 ? 'center' : 'right',
                }"
                @click="cntYearIndex = j"
              >
                {{ numWithCommas(v) }}
              </td>
            </tr>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>
