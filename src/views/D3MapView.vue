<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { initD3, info, AdminLevel, ttt, cntPop, updateInfo } from '@/composables/d3'
import { numWithCommas } from '@/composables'
import MapLayout from '@/layouts/MapLayout.vue'

onMounted(() => {
  initD3()
})
</script>

<template>
  <main class="h-full flex overflow-hidden">
    <MapLayout>
      <template #main>
        <svg id="map" class="w-full h-full">
          <defs>
            <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stop-color="orange" stop-opacity="0.2" />
              <stop offset="100%" stop-color="orange" stop-opacity="0.01" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stop-color="blue" stop-opacity="0.2" />
              <stop offset="100%" stop-color="blue" stop-opacity="0.01" />
            </linearGradient>
            <filter id="shadow" color-interpolation-filters="sRGB">
              <feDropShadow dx="1" dy="3" stdDeviation="3" flood-opacity="0.5" />
            </filter>
          </defs>
        </svg>
      </template>

      <template #aside>
        <div class="w-[400px] space-y-2">
          <div class="navigator">
            <button><span @click="updateInfo()">北北桃</span></button>
            <button v-if="ttt.city">
              >
              <span @click="updateInfo({ level: AdminLevel.city, name: ttt.city, id: ttt.cityId })">
                {{ ttt.city }}
              </span>
            </button>
            <button v-if="ttt.county">
              >
              <span @click="updateInfo({ level: AdminLevel.county, name: ttt.county, id: ttt.countyId })">
                {{ ttt.county }}
              </span>
            </button>
            <span v-if="ttt.village"> > {{ ttt.village }}</span>
          </div>

          <div>
            <span class="text-xs text-gray-500">{{ info.id }}</span>
            <div class="flex items-center">
              <h2 class="text-2xl font-bold text-blue-500">{{ info.name }}</h2>
              <div class="ml-2">({{ numWithCommas(cntPop) }})</div>
            </div>
          </div>
          <hr />
          <div class="flex overflow-scroll">
            <div class="h-max w-full">
              <svg id="chart"></svg>
            </div>
          </div>
        </div>
      </template>
    </MapLayout>
  </main>
</template>
