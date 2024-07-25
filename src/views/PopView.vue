<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { arr, buildData } from '@/composables/north/map'
import { initMap, mapStyle } from '@/composables/part/d3/map'
// import { initBarChart } from '@/composables/part/d3/barchart'
import { initMultiline } from '@/composables/part/d3/multiline'
import { getMapChunk } from '@/composables'
import { useStore } from '@/stores/main'
import TimelineBar from '@/components/map/TimelineBar.vue'
import airportLine from '@/assets/data/metro/metro-airport.json'
import greenLine from '@/assets/data/metro/metro-green.json'
import MapLayout from '@/layouts/MapLayout.vue'

const store = useStore()
const periods = ref<string[]>()
const cntYear = ref(0)

const map = ref<HTMLElement>()
// const barChart = ref<HTMLElement>()
const multiline = ref<HTMLElement>()

onMounted(async () => {
  await store.initAdminMap()
  const mapData = await getMapChunk(arr)
  const { years, dataByYear, tempKeys, keyframes, multiLineData } =
    await buildData()
  periods.value = years

  if (!map.value) return
  const { update: updateMap, drawMetro } = initMap(
    map.value,
    mapData,
    [-1000, 0, 3000]
  )
  // const { updateChart } = initBarChart(
  //   barChart.value,
  //   tempKeys,
  //   [-10000, 20000]
  // )
  // const { updateFocus } = initMultiline(
  //   multiline.value,
  //   years,
  //   tempKeys,
  //   multiLineData
  // )

  // drawMetro(airportLine.features, 'purple')
  // drawMetro(greenLine.features, 'green')

  watch(
    [cntYear],
    () => {
      updateMap(dataByYear[cntYear.value])
      // updateChart(keyframes[cntYear.value])
    },
    { immediate: true }
  )
})
</script>

<template>
  <MapLayout class="flex-col">
    <TimelineBar
      v-if="periods"
      class="p-4"
      :periods="periods"
      v-model:value="cntYear"
    />

    <!-- <svg ref="barChart" stroke-linejoin="round" font-size="0.75rem"></svg> -->
    <!-- <svg ref="multiline"></svg> -->

    <!-- legends & cntValues -->
    <!-- <ul class="grid grid-flow-row grid-cols-4 gap-2 text-sm group" @mouseleave="() => (hoverIndex = undefined)">
          <li
            v-for="(r, i) in values"
            class="group-hover:opacity-30 transition hover:!opacity-100 cursor-default"
            @mouseenter="() => (hoverIndex = i)"
          >
            <div class="flex items-center justify-center text-xs">
              <span class="w-2 h-2 rounded-full mr-2" :style="{ background: palette[i] || 'lightGray' }" />
              <p>{{ legends[i] }}</p>
            </div>
            <p class="text-center font-bold">
              {{ formatter(r[index]) }}
            </p>
          </li>
        </ul> -->

    <!-- MAIN MAP -->
    <svg ref="map" class="max-w-full max-h-full m-auto">
      <g
        v-for="l in mapStyle"
        :class="l.class"
        :fill="l.fill"
        :stroke="l.color"
        :stroke-opacity="l.opacity"
        :stroke-width="l.width"
      />
    </svg>
  </MapLayout>
</template>
