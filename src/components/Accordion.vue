<script setup lang="ts">
import { ref } from 'vue'
// import { useElementSize } from '@vueuse/core'

const props = withDefaults(defineProps<{ open?: boolean }>(), {
  open: true,
})

const control = ref(props.open)
// const el = ref(null)
// const { width, height } = useElementSize(el)
</script>

<template>
  <div class="">
    <div class="flex items-center justify-between">
      <slot name="parent" />
      <button @click="() => (control = !control)">{{ control ? '-' : '+' }}</button>
    </div>
    <div class="h-0 overflow-hidden transition aria-expanded:h-max" :aria-expanded="control" ref="el">
      <div class="pl-3 ml-1 py-2 flex border-slate-300 border-l flex-col gap-2">
        <slot name="child" />
      </div>
    </div>
  </div>
</template>
