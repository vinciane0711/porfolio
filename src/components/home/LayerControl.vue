<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import L from 'leaflet'
import MetroGroup from './MetroGroup.vue'
import AccordionVue from '../Accordion.vue'
import { metroLayer } from '@/composables/geojson'
import { metro } from '@/composables/geojson/data'

const props = defineProps<{
  map: L.Map
}>()

const boundaryText = {
  city: '縣市',
  dist: '區域',
  village: '鄉里',
}

const boundarySelect = reactive<Record<keyof typeof boundaryText, boolean>>({
  city: true,
  dist: true,
  village: true,
})

const cityPane = ref<HTMLElement>()
const distPane = ref<HTMLElement>()
const villagePane = ref<HTMLElement>()

type MetroLine = keyof typeof metro
interface MetroGroupType {
  name: string
  options: Partial<Record<MetroLine, string>>
}

const tpMetro: MetroGroupType = {
  name: '臺北捷運',
  options: {
    tpBlue: '板南線',
    tpBrown: '文湖線',
    tpGreen: '松山新店線',
    tpRed: '淡水信義線',
    tpOrange: '新莊蘆洲線',
    tpYellow: '環狀線',
    tpDanhai: '淡海輕軌',
  },
}

const tyMetro: MetroGroupType = {
  name: '桃園捷運',
  options: {
    tyAirport: '機場線',
    tyGreen: '綠線',
  },
}

const metros = [...Object.keys(tpMetro.options), ...Object.keys(tyMetro.options)].reduce(
  (acc: Record<string, L.GeoJSON>, cnt) => {
    acc[cnt] = metroLayer(metro[cnt as MetroLine])
    return acc
  },
  {}
)

onMounted(() => {
  cityPane.value = props.map.getPane('city')
  distPane.value = props.map.getPane('district')
  villagePane.value = props.map.getPane('village')
})

watch(boundarySelect, () => {
  if (!cityPane.value || !distPane.value || !villagePane.value) return
  cityPane.value.style.display = boundarySelect.city ? 'block' : 'none'
  distPane.value.style.display = boundarySelect.dist ? 'block' : 'none'
  villagePane.value.style.display = boundarySelect.village ? 'block' : 'none'
})
</script>

<template>
  <div class="flex gap-2">
    <button
      v-for="(y, i) in boundaryText"
      class="btn"
      :aria-pressed="boundarySelect[i]"
      @click="() => (boundarySelect[i] = !boundarySelect[i])"
    >
      {{ y }}
    </button>
  </div>

  <!-- METRO -->
  <AccordionVue>
    <template #parent>捷運</template>
    <template #child>
      <MetroGroup :map="map" :group="tpMetro" :metros="metros" />
      <MetroGroup :map="map" :group="tyMetro" :metros="metros" />
    </template>
  </AccordionVue>
</template>
