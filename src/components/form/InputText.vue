<script setup lang="ts">
defineProps<{
  label: string
  type: 'text' | 'number'
  step?: number
  placeholder?: string
}>()
const _v = defineModel<number | string>('value')
</script>

<template>
  <div class="flex flex-col">
    <span class="text-gray-500 text-xs">{{ label }}</span>
    <input
      class="h-6 text-sm border-b border-gray-300 placeholder:text-sm"
      :type="type"
      :step="step"
      :placeholder="placeholder"
      v-model="_v"
    />
  </div>
</template>
