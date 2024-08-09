<script setup lang="ts">
withDefaults(
  defineProps<{ icon: string; border?: boolean; size: 'sm' | 'md' | 'lg' }>(),
  {
    size: 'sm',
  }
)

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}
</script>

<template>
  <button
    class="flex rounded-full"
    :class="[border && 'border border-gray-300', sizes[size]]"
  >
    <span
      :class="icon"
      class="text-xl text-gray-500 hover:text-gray-700 m-auto"
    />
  </button>
</template>

<style scoped></style>
