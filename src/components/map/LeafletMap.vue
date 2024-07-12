<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { tileSource, drawBoundary, updateLayerColor, createPane } from '@/composables/geojson'
import { cities, pop } from '@/composables/geojson/data'
import LayerControl from '@/components/home/LayerControl.vue'
import MapLayout from '@/layouts/MapLayout.vue'

const selectedYear = ref('112') // 107-112
const population = computed(() => pop.village[selectedYear.value as keyof typeof pop.village])

const map = ref<L.Map>()
const popLayer = ref<L.GeoJSON>()
const popPane = ref<HTMLElement>()

const updateData = () => {
  if (!popLayer.value) return
  updateLayerColor(population.value, popLayer.value, 'village')
}

const initMap = () => {
  map.value = L.map('mapContainer', {
    center: [24.9969, 121.5139],
    zoom: 11,
  }).setMinZoom(10)

  createPane(map.value, 'pop', 300)
  createPane(map.value, 'village', 310)
  createPane(map.value, 'district', 320)
  createPane(map.value, 'city', 330)

  L.tileLayer(tileSource[0], {
    attribution: '©OpenStreetMap, ©CartoDB',
  }).addTo(map.value)

  popPane.value = map.value.getPane('pop')
}

const addBoundaryLayers = () => {
  if (!map.value) return
  const cityArr: any[] = []
  const distArr: any[] = []
  const villageArr: any[] = []

  for (const f of cities.features) {
    switch (f.properties.admin_level) {
      case '4':
        cityArr.push(f)
        break
      case '7':
        distArr.push(f)
        break
      case '9':
        villageArr.push(f)
        break
    }
  }

  drawBoundary(villageArr, 'village').addTo(map.value)
  drawBoundary(distArr, 'district').addTo(map.value)
  drawBoundary(cityArr, 'city').addTo(map.value)
  popLayer.value = drawBoundary(villageArr, 'pop').addTo(map.value)

  updateData()
}

onMounted(() => {
  initMap()
  addBoundaryLayers()
})

watch(selectedYear, () => {
  updateData()
})
</script>

<template>
  <MapLayout>
    <template #map>
      <div id="mapContainer" class="h-full w-full" />
    </template>

    <template #aside>
      <div class="flex gap-2">
        <select name="select-year" v-model="selectedYear" class="border border-gray-300 rounded-md px-2 w-full">
          <option v-for="y in Object.keys(pop.village).reverse()">
            {{ y }}
          </option>
        </select>
      </div>
      <LayerControl v-if="map" :map="map" />
    </template>
  </MapLayout>
</template>
