<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { initMap } from '@/composables/home/map'
import Checkbox from '@/components/form/Checkbox.vue'

const props = defineProps<{
  data: Record<string, number>
}>()

const defaultStyle = [
  { name: '主邊界', class: 'main', fill: 'transparent', show: true, opacity: 1, width: 1, color: '#dddddd' },
  { name: '副邊界', class: 'boundary', fill: 'none', show: true, opacity: 1, width: 2, color: '#999999' },
]
const mapStyle = ref(JSON.parse(JSON.stringify(defaultStyle)))
const el = ref<HTMLElement>()

function resetMapStyle() {
  mapStyle.value = JSON.parse(JSON.stringify(defaultStyle))
}

onMounted(async () => {
  if (!el.value) return
  const { updateColor } = await initMap(el.value)
  watch(
    () => props.data,
    () => {
      updateColor(props.data)
    },
    {
      immediate: true,
    }
  )
})
</script>

<template>
  <div class="border border-red-300 min-h-[600px] relative max-w-max flex overflow-hidden">
    <!-- custom color panel -->
    <div class="absolute group p-2">
      <button class="m-2 text-gray-400 rounded-full w-5 h-5 icon-[mdi--color]" />
      <div class="bg-white/75 p-4 border hidden group-focus-within:block rounded-lg" tabindex="0">
        <div class="flex gap-2 items-center" v-for="l in mapStyle">
          <label>{{ l.name }}</label>
          <Checkbox text="顯示" v-model:value="l.show" />
          <input class="w-6 h-6" type="color" v-model="l.color" :disabled="!l.show" />
          <input type="range" :min="0" :max="1" step="0.1" v-model="l.opacity" :disabled="!l.show" />
          <!-- <span> {{ l.opacity }}</span> -->
        </div>
        <!-- <button @click="resetMapStyle">reset</button> -->
      </div>
    </div>

    <!-- main map -->
    <svg ref="el" stroke-linejoin="round" class="w-[600px] h-[600px]">
      <g
        v-for="l in mapStyle"
        :class="l.class"
        :fill="l.fill"
        :stroke="l.color"
        :stroke-opacity="l.show ? l.opacity : 0"
        :stroke-width="l.width"
      />
      <g class="texts" fill="var(--gray-500)" font-size="0.75rem" text-anchor="middle" />
    </svg>
  </div>
</template>
