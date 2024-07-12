<script setup lang="ts">
defineProps<{
  label: string
  name: string
  options: string[] | Record<string, any>
  byValue?: boolean
}>()

const _v = defineModel<number | string>('value')
</script>

<template>
  <div class="flex flex-col">
    <span class="text-gray-500 text-xs">{{ label }}</span>
    <select :name="name" v-model="_v" class="h-6 text-sm min-w-20 border-b border-gray-300">
      <option v-for="(_o, i) in options" :value="byValue ? _o : i">{{ _o }}</option>
    </select>
  </div>
</template>
