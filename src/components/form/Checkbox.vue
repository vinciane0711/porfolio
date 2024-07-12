<script setup lang="ts">
defineProps<{
  text: string
}>()
const _v = defineModel<boolean>('value')
</script>

<template>
  <label>
    <input type="checkbox" v-model="_v" />
    {{ text }}
  </label>
</template>
