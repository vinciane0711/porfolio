<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/Button.vue'
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
      name="slider"
      list="tickmarks"
      :step="1"
      :min="0"
      :max="periods.length - 1"
      v-model.number="cntYear"
      class="grow text-indigo-500"
    />

    <Button
      :icon="intervalId ? 'icon-[mdi--pause]' : 'icon-[mdi--play]'"
      @click="intervalId ? stopInterval() : runInterval()"
      class="sm:size-6 size-8"
    />
  </div>
</template>
<style>
/* ref: https://codepen.io/t_afif/pen/KKGpmGE?editors=1100 */
input {
  --c: orange; /* active color */
  --g: 4px; /* the gap */
  --l: 6px; /* line thickness*/
  --s: 32px; /* thumb size*/

  height: var(--s); /* needed for Firefox*/
  --_c: color-mix(in srgb, var(--c), #000 var(--p, 0%));
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  overflow: hidden;
}
@media screen and (min-width: 450px) {
  input {
    --s: 24px;
  }
}
input:active,
input:focus-visible {
  --_b: var(--s);
}
/* chromium */
input[type='range']::-webkit-slider-thumb {
  height: var(--s);
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow: 0 0 0 var(--_b, var(--l)) inset var(--_c);
  border-image: linear-gradient(90deg, var(--_c) 50%, #ababab 0) 0 1 /
    calc(50% - var(--l) / 2) 100vw/0 calc(100vw + var(--g));
  -webkit-appearance: none;
  appearance: none;
  transition: 0.3s;
}
/* Firefox */
input[type='range']::-moz-range-thumb {
  height: var(--s);
  width: var(--s);
  background: none;
  border-radius: 50%;
  box-shadow: 0 0 0 var(--_b, var(--l)) inset var(--_c);
  border-image: linear-gradient(90deg, var(--_c) 50%, #ababab 0) 0 1 /
    calc(50% - var(--l) / 2) 100vw/0 calc(100vw + var(--g));
  -moz-appearance: none;
  appearance: none;
  transition: 0.3s;
}
</style>
