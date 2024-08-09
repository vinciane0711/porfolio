<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  views,
  sumData,
  taiwanData,
  sortedData,
  cityList,
  type DiffType,
  type ICsvObj,
} from '@/composables/taiwan'
import MapLayout from '@/layouts/MapLayout.vue'
import Chart from '@/components/taiwan/MultiLineChart.vue'
import TimelineBar from '@/components/taiwan/TimelineBar.vue'
import BarChart from '@/components/taiwan/BarChart.vue'
import Map from '@/components/taiwan/Map.vue'
import Table from '@/components/taiwan/Table.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'

import { onClickOutside, useWindowSize } from '@vueuse/core'
import { numWithCommas } from '@/composables'

const years = Array.from({ length: 14 }).map((y, i) => i + 99)
const cntYearIndex = ref(0)
const cntView = ref<DiffType>('POP')
const cntViewIndex = ref(2)
const cntCityName = ref('')
const tableData = ref<{
  name: string
  table: ICsvObj | undefined
}>({
  name: '',
  table: undefined,
})

const { width } = useWindowSize()
const modal = ref(false)
const modalRef = ref(null)
onClickOutside(modalRef, (e) => (modal.value = false))

const cityPeriodsData = computed(() => {
  if (!cntCityName.value) return
  const _d = sumData.filter((c) => c.city === cntCityName.value)!
  _d.sort((a, b) => +a.year - +b.year)
  const rows: number[][] = [[], [], [], []]
  _d.map((y) => y[cntView.value]).forEach((e) => {
    rows[0].push(e[0])
    rows[1].push(e[1])
    rows[2].push(e[2])
    rows[3].push(e[3])
  })
  return {
    keys: ['年分', ...views[cntView.value].cols, '增加數', '增加率'],
    rows: [years, ...rows],
  } as ICsvObj
})

const cntCityData = computed(
  () => sortedData[cntView.value][cntViewIndex.value][years[cntYearIndex.value]]
)

const dynamicRange = computed(
  () => views[cntView.value].range[cntViewIndex.value]
)

const openTable = (name: string, data: ICsvObj) => {
  tableData.value = { name, table: data }
  modal.value = true
}

const changeCity = (name: string) => (cntCityName.value = name)
</script>

<template>
  <MapLayout class="max-xs:gap-2">
    <div
      v-if="width >= 450"
      class="flex flex-col gap-2 xs:gap-4 w-full xs:w-max"
    >
      <h1>
        全台人口變化
        <select
          class="bg-transparent border p-1 rounded-md"
          v-model="cntYearIndex"
        >
          <option v-for="(y, i) in years" :value="i">{{ y }}</option>
        </select>
      </h1>

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

      <Card>
        <template #title>全台灣</template>
        <template #header>
          <Button
            icon="icon-[mdi--table]"
            @click="openTable('全台灣', taiwanData[cntView])"
          />
        </template>
        <Chart
          :years="years"
          :file="taiwanData[cntView]"
          :yearIndex="cntYearIndex"
          :viewIndex="cntViewIndex"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
        />
      </Card>

      <Card v-if="cityPeriodsData">
        <template #title>{{ cntCityName }}</template>
        <template #header>
          <Button
            icon="icon-[mdi--table]"
            @click="openTable(cntCityName, cityPeriodsData!)"
          />
        </template>
        <Chart
          :years="years"
          :file="cityPeriodsData!"
          :yearIndex="cntYearIndex"
          :viewIndex="cntViewIndex"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
        />
      </Card>

      <Card v-else>
        <template #title>選擇城市</template>
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
      </Card>
    </div>

    <!-- MAIN MAP -->
    <Map
      class="max-w-full max-h-[80%] m-auto"
      :data="cntCityData"
      :range="dynamicRange"
      :cnt-city="cntCityName"
      @changeCity="changeCity"
    />

    <div v-if="width < 450" class="flex flex-col gap-4">
      <hr />
      <div class="*:bg-transparent *:p-0.5 *:flex-grow flex text-lg font-bold gap-2">
        <select v-model="cntYearIndex">
          <option v-for="(y, i) in years" :value="i">{{ y }}</option>
        </select>
        <select v-model="cntCityName">
          <option value="">全台灣</option>
          <option v-for="c in cityList" :value="c">{{ c }}</option>
        </select>
        <select v-model="cntView">
          <option v-for="(v, i) in views" :value="i">{{ v.title }}</option>
        </select>
        <select v-model="cntViewIndex">
          <option v-for="(v, i) in [...views[cntView].cols, '總覽']" :value="i">
            {{ v }}
          </option>
        </select>
      </div>
      <TimelineBar :periods="years" v-model:value="cntYearIndex" />

      <div class="h-max">
        <Chart
          v-if="cityPeriodsData"
          :years="years"
          :file="cityPeriodsData!"
          :yearIndex="cntYearIndex"
          :viewIndex="cntViewIndex"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
        />
        <Chart
          v-else
          :years="years"
          :file="taiwanData[cntView]"
          :yearIndex="cntYearIndex"
          :viewIndex="cntViewIndex"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
        />
      </div>
      <hr />
      <p class="text-xs text-gray-500 text-right">
        <a href="https://www.ris.gov.tw/app/portal/346" target="_blank">
          資料來源：內政部戶政司全球資訊網
        </a>
      </p>
      <!-- > 人口統計資料 > 三. 年度縣市及全國統計資料 > 20.
    縣市人口增加、自然增加及社會增加(99) -->
    </div>

    <Card v-if="width >= 1024" class="my-auto h-max max-h-full">
      <template #title> 各縣市資料</template>
      <template #header>
        {{
          numWithCommas(
            taiwanData[cntView].rows[cntViewIndex + 1][cntYearIndex]
          )
        }}
      </template>
      <div class="w-full max-h-max h-full overflow-y-auto">
        <BarChart
          :cityList="cityList"
          :data="cntCityData"
          :range="dynamicRange"
          :cntCity="cntCityName"
          @changeCity="changeCity"
        />
      </div>
    </Card>
  </MapLayout>

  <!-- TODO: modal component -->
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
      <template v-if="tableData.table">
        <h3 class="text-center">
          {{ tableData.name }} {{ views[cntView].title }}
        </h3>
        <div class="w-full overflow-x-auto">
          <Table
            :data="tableData.table"
            :years="years"
            :cntYear="years[cntYearIndex]"
          />
        </div>
      </template>
    </div>
  </div>
</template>
