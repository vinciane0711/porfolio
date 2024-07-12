import { computed, onMounted, ref } from 'vue'

export const arrangeCols = (list: any[]) => {
  const tempId = ref('')
  const newList = ref([...list])

  function dragover(ev: DragEvent) {
    ev.preventDefault()
    ev.dataTransfer!.dropEffect = 'move'
  }

  function drag(ev: DragEvent) {
    const _t = ev.target as HTMLElement
    tempId.value = _t.getAttribute('data-id')!
    ev.dataTransfer!.effectAllowed = 'move'
  }

  function drop(ev: DragEvent) {
    const _t = ev.target as HTMLElement
    const cntId = _t.getAttribute('data-id')
    if (cntId && tempId.value !== cntId) {
      const [from, to] = [newList.value.indexOf(tempId.value), newList.value.indexOf(cntId)]
      ;[newList.value[from], newList.value[to]] = [newList.value[to], newList.value[from]]
    }
  }

  return { drag, dragover, drop, newList }
}
