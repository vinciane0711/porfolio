<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  options: string[]
  cntValue: string[]
  func: (str: string, boo: boolean) => void
}>()

const text = computed(() => {
  return props.cntValue.length === 0
    ? '請選擇項目'
    : props.cntValue.length === props.options.length
    ? '全選'
    : props.cntValue.length <= 3
    ? props.cntValue.join('、')
    : `已選 ${props.cntValue.length} 項`
})
</script>

<template>
  <div class="flex flex-col">
    <span class="text-gray-500 text-xs">{{ label }}</span>
    <div class="w-[200px] h-6 flex items-center relative group border-b border-gray-300 cursor-pointer" tabindex="0">
      <p class="truncate w-full text-sm">{{ text }}</p>
      <!-- remove all  btn-->
      <button v-if="cntValue.length" class="p-0.5 icon-[mdi--close]" @click="func('all', false)" />

      <!-- dropdown -->
      <!-- TODO: collapse transition -->
      <div
        v-if="options.length"
        class="max-h-0 absolute top-[calc(100%+10px)] left-0 group-focus-within:max-h-max z-10 overflow-hidden"
      >
        <div
          class="grid grid-cols-4 grid-flow-row h-max w-max gap-3 text-sm p-4 border border-gray-300 rounded-md backdrop-blur-md"
        >
          <label class="white-space-nowrap flex items-center" v-for="o in ['all', ...options]">
            <input
              class="mr-1"
              type="checkbox"
              :value="o"
              @change="(e) => func(o, (<HTMLInputElement>e.target).checked)"
              :checked="o === 'all' ? cntValue.length === options.length : cntValue.includes(o)"
            />
            <span>{{ o === 'all' ? '全部' : o }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
