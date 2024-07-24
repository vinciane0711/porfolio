<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  periods: number[] | string[]
}>()

const cntYear = defineModel<number>('value')
const intervalId = ref<ReturnType<typeof setInterval>>()

const stopInterval = () => {
  clearInterval(intervalId.value)
  intervalId.value = undefined
}

const runInterval = () => {
  if (cntYear.value === props.periods.length - 1) cntYear.value = 0

  intervalId.value = setInterval(() => {
    if (cntYear.value === props.periods.length - 1) return stopInterval()
    cntYear.value!++
  }, 1000)
}
</script>

<template>
  <div class="flex w-full h-max gap-2 items-center">
    <input
      type="range"
      name="temp"
      list="tickmarks"
      :step="1"
      :min="0"
      :max="periods.length - 1"
      v-model.number="cntYear"
      class="grow slider"
    />
    <datalist id="tickmarks">
      <option
        v-for="y in periods.length"
        :value="y"
        :label="y.toString()"
      ></option>
    </datalist>

    <button
      class="bg-gray-200 p-0.5 w-6 h-6 rounded-full"
      @click="intervalId ? stopInterval() : runInterval()"
    >
      <span :class="intervalId ? 'icon-[mdi--pause]' : 'icon-[mdi--play]'" />
    </button>
    <!-- <span class="min-w-[30px] text-center">{{ periods[cntYear!] }}</span> -->
  </div>
</template>

