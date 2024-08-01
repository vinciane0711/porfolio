<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  views,
  sumData,
  taiwanData,
  diffFunc,
  type DiffType,
  type ICsvObj,
} from '@/composables/taiwan'
import MapLayout from '@/layouts/MapLayout.vue'
import Chart from '@/components/taiwan/MultiLineChart.vue'
import TimelineBar from '@/components/taiwan/TimelineBar.vue'
import BarChart from '@/components/taiwan/BarChart.vue'
import Map from '@/components/taiwan/Map.vue'
import { onClickOutside, useWindowSize } from '@vueuse/core'
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
const { width } = useWindowSize()

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
</script>

<template>
  <MapLayout class="max-xs:gap-2">
    <div class="flex flex-col gap-2 xs:gap-4 w-full xs:w-max">
      <h1>
        全台人口變化
        <select
          class="bg-transparent border p-1 rounded-md"
          v-model="cntYearIndex"
        >
          <option v-for="(y, i) in years" :value="i">{{ y }}</option>
        </select>
      </h1>

      <template v-if="width >= 450">
        <TimelineBar :periods="years" v-model:value="cntYearIndex" />
        <div class="flex items-center">
          <select
            v-model="cntView"
            class="border border-gray-300 p-1 text-sm rounded-lg"
          >
            <option v-for="(v, i) in views" :value="i">{{ v.title }}</option>
          </select>
          <button class="flex ml-1">
            <span
              class="icon-[mdi--information-outline] text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
            />
          </button>

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
        <div v-else class="basicWrap w-full sm:w-[400px]">
          <h3>選擇城市</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              class="border border-gray-300 text-sm px-2 py-1.5 rounded-md"
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
      </template>
    </div>

    <!-- MAIN MAP -->
    <Map
      class="max-w-full max-h-[80%] m-auto md:ml-4"
      :data="cntCityData[cntYear]"
      :range="dynamicRange"
      :cnt-city="cntCityName"
      @changeCity="changeCity"
    />

    <div
      v-if="width < 450"
      class="flex flex-col gap-4 border border-gray-300 p-4 rounded-md"
    >
      <TimelineBar :periods="years" v-model:value="cntYearIndex" />
      <div class="flex items-center">
        <select
          v-model="cntView"
          class="border border-gray-300 p-1 text-sm rounded-lg"
        >
          <option v-for="(v, i) in views" :value="i">{{ v.title }}</option>
        </select>
        <button class="flex ml-1">
          <span
            class="icon-[mdi--information-outline] text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
          />
        </button>

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

      <hr />
      <div>
        <Chart
          v-if="cityPeriodsData"
          class="border-none !p-0"
          :years="years"
          :title="cntCityName"
          :file="cityPeriodsData!"
          :yearIndex="cntYearIndex"
          :viewIndex="cntViewIndex"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
          @openTable="openTable"
        />
        <div v-else class="basicWrap w-full sm:w-[400px] border-none !p-0">
          <h3>選擇城市</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              class="border border-gray-300 text-sm px-2 py-1.5 rounded-md"
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
    </div>

    <div
      v-if="width >= 1024"
      class="basicWrap my-auto h-max max-h-full w-[350px] max-xl:fixed max-xl:right-4 max-xl:top-4 max-xl:bottom-4 max-xl:bg-white/60"
    >
      <h3>各縣市資料</h3>
      <div class="w-max max-h-max h-full overflow-y-scroll">
        <BarChart
          :data="cntCityData[cntYear]"
          :range="dynamicRange"
          :cnt-city="cntCityName"
          @changeCity="changeCity"
        />
      </div>
    </div>

    <!-- <p class="text-xs text-gray-500">
        <span> 資料來源： </span> <br />
        <a href="https://www.ris.gov.tw/app/portal/346" target="_blank">
          內政部戶政司全球資訊網 > 人口統計資料 > 三. 年度縣市及全國統計資料 >
          20. 縣市人口增加、自然增加及社會增加(99)
        </a>
      </p> -->
  </MapLayout>

  <div
    v-if="modal"
    ref="modalRef"
    class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[80%] z-10"
  >
    <div class="basicWrap shadow-md">
      <button class="absolute top-2 right-2 flex" @click="modal = false">
        <span
          class="icon-[mdi--close] text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
        />
      </button>
      <template v-if="tableData">
        <h3 class="text-center">
          {{ tableData.name }} {{ views[cntView].title }}
        </h3>
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
