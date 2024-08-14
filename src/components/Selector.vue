<script setup lang="ts">
const model = defineModel()
defineProps<{
  options: string[] | number[] | Record<string, string | number>
  indexValue?: boolean
}>()
</script>

<template>
  <select
    v-model="model"
    class="appearance-none bg-transparent forced-colors:appearance-auto p-1 pr-6 text-center rounded-md focus:bg-gray-100 focus:outline-none bg-arrow-icon bg-no-repeat bg-[center_right_-0.5rem] bg-[length:50%_50%]"
  >
    <slot v-if="$slots.default" />
    <option v-for="(o, i) in options" :value="indexValue ? i : o">
      {{ o }}
    </option>
  </select>
</template>
