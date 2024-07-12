<script setup lang="ts">
defineProps<{
  func: () => void
  icon: string
}>()
</script>

<template>
  <button class="border border-gray-400 text-gray-400 rounded-full w-5 h-5 flex" @click="func">
    <span class="m-auto" :class="icon"></span>
  </button>
</template>
