<script setup lang="ts">
import AccordionVue from './Accordion.vue'
import { ref, watch } from 'vue'
const props = defineProps<{
  group: {
    name: string
    options: Record<string, string>
  }
}>()

const optionValues = Object.keys(props.group.options)
const allSelected = ref(false)
const indeterminate = ref(false)
const selected = ref<string[]>([])

const emit = defineEmits(['selectAllFunc', 'changeFunc'])

const toggleAll = () => {
  selected.value = allSelected.value ? optionValues.slice() : []
  emit('selectAllFunc', allSelected.value)
}

watch(selected, (newValue, oldValue) => {
  if (newValue.length === 0) {
    indeterminate.value = false
    allSelected.value = false
  } else if (newValue.length === optionValues.length) {
    indeterminate.value = false
    allSelected.value = true
  } else {
    indeterminate.value = true
    allSelected.value = false
  }
})
</script>

<template>
  <AccordionVue>
    <template #parent>
      <label>
        <input type="checkbox" v-model="allSelected" :indeterminate="indeterminate" @change="toggleAll" />
        {{ group.name }}
      </label>
    </template>
    <template #child>
      <label v-for="(line, key) in group.options">
        <input type="checkbox" :value="key" v-model="selected" @change="(e) => $emit('changeFunc', e)" />
        {{ line }}
      </label>
    </template>
  </AccordionVue>
</template>
