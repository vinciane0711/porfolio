<script setup lang="ts">
withDefaults(
  defineProps<{ icon: string; border?: boolean; size?: 'sm' | 'md' | 'lg' }>(),
  {
    size: 'sm',
  }
)

const sizes = {
  sm: 'size-6 text-xl',
  md: 'size-8 text-2xl',
  lg: 'size-12 text-2xl',
}
</script>

<template>
  <button
    class="flex rounded-full"
    :class="[border && 'border border-gray-300', sizes[size]]"
  >
    <span :class="icon" class="text-gray-500 hover:text-gray-700 m-auto" />
  </button>
</template>
