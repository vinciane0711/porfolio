<script setup lang="ts">
import L from 'leaflet'
import CheckboxGroup from '@/components/CheckboxGroup.vue'
import { ref, onMounted } from 'vue'

const props = defineProps<{
  map: L.Map
  group: {
    name: string
    options: Record<string, string>
  }
  metros: Record<string, L.Layer>
}>()

const layer = ref(L.layerGroup())
const ids = Object.keys(props.group.options)

const toggleAllLayer = (allSelected: boolean) => {
  if (allSelected) {
    for (const id of ids) {
      const _l = props.metros[id]
      layer.value.addLayer(_l)
    }
  } else {
    layer.value.clearLayers()
  }
}

const toggleSingleLayer = (event: Event) => {
  const { checked, value } = event.target as HTMLInputElement
  const _l = props.metros[value]
  if (checked) {
    layer.value.addLayer(_l)
  } else {
    // const _i = layer.value.getLayerId(_l)
    layer.value.removeLayer(_l)
  }
}

onMounted(() => {
  layer.value.addTo(props.map)
})
</script>

<template>
  <CheckboxGroup :group="group" @selectAllFunc="toggleAllLayer" @changeFunc="toggleSingleLayer" />
</template>
