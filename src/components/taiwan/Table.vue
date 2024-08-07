<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type ICsvObj } from '@/composables/taiwan'
import { numWithCommas } from '@/composables'
defineProps<{ data: ICsvObj; years: number[]; cntYear: number }>()
</script>

<template>
  <table class="text-xs [*_td]:p-0.5 rounded-md">
    <colgroup>
      <col />
      <col v-for="y in years" :class="y === cntYear && 'bg-gray-100'" />
    </colgroup>
    <tr v-for="(r, i) in data.rows">
      <td>{{ data.keys[i] }}</td>
      <td
        v-for="(v, j) in r"
        :style="{
          color: v < 0 ? 'red' : 'current',
          textAlign: i === 0 ? 'center' : 'right',
        }"
      >
        <!-- @click="cntYearIndex = j" -->
        {{ numWithCommas(v) }}
      </td>
    </tr>
  </table>
</template>

<style scoped></style>
