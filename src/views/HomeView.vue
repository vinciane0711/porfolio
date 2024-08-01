<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3'
import { useStore } from '@/stores/main'
import ControlPanel from '@/components/home/ControlPanel.vue'
import TaiwanMap from '@/components/home/TaiwanMap.vue'
// import BarChart from '@/components/home/BarChart.vue'
import MultiLineChart from '@/components/home/MultiLineChart.vue'
import Selection from '@/components/form/Selection.vue'
import Checkbox from '@/components/form/Checkbox.vue'
import TimelineBar from '@/components/map/TimelineBar.vue'

import TableLoader from '@/components/home/TableLoader.vue'
import { formRelation, type FormRel, buildData, type IFileData } from '@/composables/home'

const store = useStore()
const continuousData = ref<{ [key: string]: number }[]>()
const dataSum = ref<number[]>()
const filesData = ref<string[][]>()
const years = ref<string[]>()
const cntIndex = ref(0)

const relation = ref<FormRel>('minus')
const tableA = ref<InstanceType<typeof TableLoader>>()
const tableB = ref<InstanceType<typeof TableLoader>>()

const showMap = ref(true)
const showBarChert = ref(true)
const showLineChart = ref(true)

// const ready = computed(() => {
//   continuousData.value = undefined
//   dataSum.value = undefined
//   cntIndex.value = 0
//   return (relation.value === 'none' && tableA.value?.fileData) || (tableA.value?.fileData && tableB.value?.fileData)
// })

const bbb = () => {
  let sub: { rel: 'add' | 'minus'; file: IFileData } | undefined = undefined
  if (!tableA.value?.fileData) {
    console.log('no table-A')
    return
  }

  if (relation.value !== 'none') {
    if (!tableB.value?.fileData) {
      console.log('no table-B')
      return
    } else {
      sub = { rel: relation.value, file: tableB.value.fileData }
    }
  }

  const { rows, parsedRows, dataByYear, dataSum: sum, range } = buildData(tableA.value.fileData, sub)
  const [blank, ...times] = tableA.value.fileData.head
  years.value = times
  store.cntRows = rows
  store.parseRows = parsedRows
  dataSum.value = sum
  continuousData.value = dataByYear
  store.range = range
}

// onMounted(async () => {
//   await store.initAdminMap()
// })
</script>

<template>
  <div class="flex m-4 gap-4 grow overflow-hidden">
    <div class="flex flex-col gap-4 w-[600px] overflow-scroll">
      <ControlPanel />
      <div class="flex gap-2">
        <!-- <Selection
          label="值"
          name="cntValue"
          :options="{
            sum: '加總',
            average: '平均',
          }"
          v-model:value="ddd"
        /> -->
        <Selection label="表格關聯" name="relation" :options="formRelation" v-model:value="relation" />
      </div>

      <TableLoader ref="tableA" name="A" :val-index="cntIndex" />
      <TableLoader :style="{ opacity: relation === 'none' ? 0.5 : 1 }" ref="tableB" name="B" :val-index="cntIndex" />

      <button class="border border-gray-300 rounded-lg p-4" @click="bbb">建立資料</button>

      <TimelineBar v-if="years" :periods="years" v-model:value="cntIndex" />
    </div>

    <div v-if="continuousData" class="overflow-scroll flex gap-4 border border-gray-300">
      <div>
        <TaiwanMap :data="continuousData[cntIndex]" />
        <!-- TODO: handle lineChart -->
        <MultiLineChart
          v-if="dataSum && years && filesData"
          :head="years"
          :data="filesData"
          :dataSum="dataSum"
          :index="cntIndex"
          :legends="[]"
          @changeYear="(n:number)=>cntIndex=n"
        />
      </div>
      <!-- <BarChart :data="continuousData[cntIndex]" /> -->
    </div>
  </div>
</template>
