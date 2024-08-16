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
import Selector from '@/components/Selector.vue'
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

const viewTitles = Object.entries(views).reduce((acc, cnt) => {
  const [key, value] = cnt
  acc[key as DiffType] = value.title
  return acc
}, {} as Record<DiffType, string>)

const { width } = useWindowSize()
const modal = ref(false)
const modalRef = ref(null)
onClickOutside(modalRef, (e) => (modal.value = false))

const cityPeriodsData = computed(() => {
  if (!cntCityName.value) return
  const _d = sumData.filter((c) => c.city === cntCityName.value)
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
      class="flex flex-col gap-2 w-full sm:w-max overflow-y-auto"
    >
      <h1 class="inline-flex items-center">
        全台人口變化圖
        <Selector
          class="mr-2"
          v-model="cntYearIndex"
          :options="years"
          :indexValue="true"
        />
      </h1>

      <Card>
        <TimelineBar :periods="years" v-model:value="cntYearIndex" />
        <div class="flex items-center text-sm justify-between">
          <Selector
            class="border border-gray-300"
            v-model="cntCityName"
            :options="cityList"
          >
            <template #default> <option value="">全台灣</option></template>
          </Selector>

          <div
            class="flex divide-x border border-gray-300 rounded-md overflow-hidden"
          >
            <Selector
              class="rounded-none"
              v-model="cntView"
              :options="viewTitles"
              :indexValue="true"
            />
            <Selector
              class="rounded-none"
              v-model="cntViewIndex"
              :options="[...views[cntView].cols, '總覽']"
              :indexValue="true"
            />
          </div>
        </div>
      </Card>

      <Card>
        <template #title>全台灣 {{ views[cntView].title }}</template>
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
        <template #title>{{ cntCityName }} {{ views[cntView].title }}</template>
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
        <div class="grid grid-cols-3 gap-2 h-[200px]">
          <button
            class="border border-gray-300 px-2 py-1.5 rounded-md"
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
      <a
        class="text-xs text-gray-500 mt-auto"
        href="https://www.ris.gov.tw/app/portal/346"
        target="_blank"
      >
        資料來源：內政部戶政司全球資訊網-人口統計資料
      </a>
    </div>

    <!-- MAIN MAP -->
    <div class="flex flex-grow xs:h-full h-1/3">
      <Map
        class="xs:max-h-[80%] m-auto max-h-full"
        :data="cntCityData"
        :range="dynamicRange"
        :cnt-city="cntCityName"
        @changeCity="changeCity"
      />
    </div>

    <!-- mobile -->
    <template v-if="width < 450">
      <Card>
        <div class="flex text-lg font-bold [&>select]:flex-grow items-center">
          <Selector
            v-model="cntYearIndex"
            :options="years"
            :indexValue="true"
          />
          <Selector v-model="cntCityName" :options="cityList">
            <template #default> <option value="">全台灣</option></template>
          </Selector>
          <Selector
            v-model="cntView"
            :options="viewTitles"
            :indexValue="true"
          />
          <Button
            icon="icon-[mdi--table]"
            size="md"
            @click="
              cityPeriodsData
                ? openTable(cntCityName, cityPeriodsData)
                : openTable('全台灣', taiwanData[cntView])
            "
          />
        </div>
        <TimelineBar :periods="years" v-model:value="cntYearIndex" />
        <Chart
          :years="years"
          :file="cityPeriodsData || taiwanData[cntView]"
          :yearIndex="cntYearIndex"
          :viewIndex="cntViewIndex"
          @changeYear="(n:number)=>cntYearIndex=n"
          @changeViewIndex="(n:number)=>cntViewIndex=n"
        />
      </Card>
      <a
        class="text-xs text-gray-500"
        href="https://www.ris.gov.tw/app/portal/346"
        target="_blank"
      >
        資料來源：內政部戶政司全球資訊網-人口統計資料
      </a>
    </template>

    <Card v-if="width >= 1024" class="my-auto h-max max-h-full">
      <template #title
        >各縣市 {{ views[cntView].title }}-{{
          views[cntView].cols[cntViewIndex] || '總覽'
        }}</template
      >
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
    class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 xs:p-4 max-w-full z-10"
  >
    <div class="basicWrap shadow-md max-w-max relative">
      <button class="absolute top-2 right-2 flex" @click="modal = false">
        <span
          class="icon-[mdi--close] text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
        />
      </button>
      <template v-if="tableData.table">
        <h3 class="text-center">
          {{ tableData.name }} {{ viewTitles[cntView] }}
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
