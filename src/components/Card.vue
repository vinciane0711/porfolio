<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// defineProps<{ msg: any }>()
</script>

<template>
  <div class="basicWrap w-full sm:w-[350px]">
    <div class="flex items-center justify-between">
      <h3 v-if="$slots.title"><slot name="title" /></h3>
      <div v-if="$slots.header"><slot name="header" /></div>
    </div>

    <slot />
  </div>
</template>
