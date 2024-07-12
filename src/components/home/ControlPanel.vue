<script setup lang="ts">
import { useStore } from '@/stores/main'
import MultiSelect from '@/components/form/MultiSelect.vue'
import Selection from '@/components/form/Selection.vue'
import InputText from '@/components/form/InputText.vue'
import Checkbox from '@/components/form/Checkbox.vue'

const store = useStore()
const selectTown = (option: string | 'all', isChecked: boolean) => {
  if (option === 'all') {
    store.cntTown = isChecked ? [...store.townsList] : []
  } else {
    if (!isChecked) {
      const index = store.cntTown.findIndex((c) => c === option)
      store.cntTown.splice(index, 1)
    } else {
      store.cntTown.push(option)
    }
  }
}
</script>

<template>
  <div class="flex gap-2 items-center">
    <Selection label="地圖層級" name="map-level" :options="store.MapLevelObj" v-model:value="store.selectLevel" />
    <Selection
      v-if="store.selectLevel !== 'county' && store.selectLevel !== 'countyDetail'"
      label="選擇縣市"
      name="county"
      :options="store.counties"
      v-model:value="store.cntCounty"
      @change="store.cntTown = []"
      :by-value="true"
    />
    <MultiSelect
      v-if="store.selectLevel === 'village'"
      label="選擇區域"
      :options="store.townsList"
      :cntValue="store.cntTown"
      :func="selectTown"
    />
    <!-- <button class="text-gray-400 rounded-full w-5 h-5 icon-[mdi--reload]" /> -->
  </div>

  <div class="flex gap-2">
    <Checkbox text="自動範圍" v-model:value="store.rangeControl.dynamic" />
    <InputText type="number" :step="10" label="最小值" v-model:value="store.rangeControl.min" />
    <InputText type="number" :step="10" label="最大值" v-model:value="store.rangeControl.max" />
  </div>
</template>
