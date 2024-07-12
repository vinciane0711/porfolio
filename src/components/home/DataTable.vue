<script setup lang="ts">
import { ref } from 'vue'
import IconButton from '@/components/IconButton.vue'
import Selection from '@/components/form/Selection.vue'
import InputText from '@/components/form/InputText.vue'

defineProps<{
  fileName: string
  head: string[]
  data: string[][]
  valIndex: number
}>()

const expand = ref(true)
const prefixText = defineModel<string>('prefix')
const needParsed = defineModel<boolean>('needParsed')

const emit = defineEmits(['delete'])
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-2 mb-2">
      <div class="flex items-center">
        <p><span class="icon-[mdi--file] text-gray-500" /> {{ fileName }}</p>
        <div class="ml-auto flex space-x-2">
          <IconButton icon="icon-[mdi--arrow-collapse]" :func="() => (expand = !expand)" />
          <IconButton icon="icon-[mdi--close]" :func="() => emit('delete')" />
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <!-- <InputText type="text" label="標題" v-model:value="title" placeholder="請輸入標題" /> -->
        <!-- <Selection label="欄" name="valIndex" :options="head.slice(1, head.length)" v-model:value="valIndex" /> -->
        <label> <input type="checkbox" v-model="needParsed" /> 區域轉碼 </label>
        <InputText type="text" label="地區前綴" v-model:value="prefixText" placeholder="ex.臺北市信義區" />
      </div>
    </div>

    <!-- Expanded Table -->
    <div
      :aria-expanded="expand"
      class="flex overflow-scroll transition-[max-height] aria-expanded:max-h-[300px] max-h-0"
    >
      <div class="grow max-w-full: overflow-scroll flex border border-gray-300">
        <table class="text-xs [&_th]:p-1 [&_td]:p-1 w-full">
          <!-- group column -->
          <colgroup>
            <col
              v-for="(col, i) in head"
              :class="(i === 0 && 'bg-blue-50') || (valIndex! + 1 === i && 'bg-yellow-50')"
            />
          </colgroup>

          <!-- header -->
          <tr class="bg-gray-100 sticky top-0">
            <!-- @click="() => (valIndex = i - 1)" -->
            <th
              v-for="(val, i) in head"
              :class="(i === 0 && 'bg-blue-200') || (valIndex! + 1 === i && 'bg-yellow-200')"
            >
              {{ val }}
            </th>
          </tr>

          <!-- content -->
          <tr v-for="(row, i) in data">
            <td v-for="val in row">
              {{ val }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
