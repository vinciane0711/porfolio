<script setup lang="ts">
import { type ICsvObj } from '@/composables/taiwan'
import { numWithCommas } from '@/composables'
const props = defineProps<{ data: ICsvObj; years: number[]; cntYear: number }>()

const { keys, rows } = props.data
const [hKey, ...restKeys] = keys
const [hRow, ...restRows] = rows
</script>

<template>
  <table>
    <colgroup>
      <col />
      <col v-for="y in years" :class="y === cntYear && 'bg-orange-50'" />
    </colgroup>

    <thead>
      <tr>
        <th class="sticky top-0 left-0 bg-gray-100 z-[2]">{{ hKey }}</th>
        <th v-for="(h, i) in hRow" class="sticky top-0 bg-gray-100 z-[1]">
          {{ h }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(r, i) in restRows">
        <th class="sticky left-0 bg-gray-100 z-[1]">{{ restKeys[i] }}</th>
        <td
          v-for="(v, j) in r"
          :style="{
            color: v < 0 ? 'red' : 'current',
          }"
        >
          {{ numWithCommas(v) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
