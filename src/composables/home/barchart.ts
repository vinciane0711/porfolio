import * as d3 from 'd3'
import { useStore } from '@/stores/main'

const store = useStore()

export const margin = { top: 30, right: 15, bottom: 0, left: 15 }
export const initBarChart = (el: HTMLElement) => {
  const dataKeys = store.parseRows
  const barSize = 30
  const length = dataKeys.length
  const _w = 400
  const _h = barSize * length
  const width = _w + margin.left + margin.right
  const height = _h + margin.top + margin.bottom

  const x = d3.scaleLinear().rangeRound([0, _w]).domain(store.range)
  // TODO: reorder by rank
  const y = d3.scaleBand().range([0, _h]).domain(dataKeys).padding(0.2)
  // d3.range(length)
  const barChart = d3.select(el).attr('width', width).attr('height', height).attr('viewBox', [0, 0, width, height])
  const contentGroup = barChart.select('.contentGroup')
  const rectGroup = contentGroup.select('.rectGroup')
  const textGroup = contentGroup.select('.textGroup')
  const valueGroup = contentGroup.select('.valueGroup')
  const zeroLine = contentGroup.select('line').attr('y2', _h)

  textGroup
    .selectAll('text')
    .data(dataKeys)
    .join(
      (enter) =>
        enter
          .append('text')
          .attr('dy', '1rem')
          .attr('x', 5)
          .attr('y', (d, i) => y(d) as number)
          .text((d, i) => store.cntRows[i])
      // (update) => update.text((d, i) => d).attr('y', (d, i) => y(i) as number)
    )

  function axis() {
    const g = contentGroup.append('g')
    const axis = d3.axisTop(x).ticks(5, '~s').tickSizeOuter(0)
    return () => g.transition().call(axis)
  }

  const updateAxis = axis()
  const base = store.range[0] < 0 && store.range[1] > 0 ? 0 : store.range[0]
  const basePo = x(base)
  const xPo = (d: number) => (d > 0 ? basePo : x(d) < 0 ? 0 : x(d))
  zeroLine.transition().attr('x1', basePo).attr('x2', basePo)

  const widthFunc = (d: number) => {
    const diff = Math.abs(x(d) - basePo)
    return diff >= _w ? _w : diff
  }

  function updateChart(data: Record<string, number>) {
    const arr = Object.keys(data).map((key) => {
      return { key, value: data[key] }
    })

    updateAxis()

    rectGroup
      .selectAll('rect')
      .data(arr)
      .join(
        (enter) =>
          enter
            .append('rect')
            .attr('opacity', 0.2)
            .attr('height', y.bandwidth())
            .attr('y', (d, i) => y(d.key) as number)
            .attr('x', (d) => xPo(d.value))
            .attr('fill', (d) => (d.value > 0 ? 'var(--mainColor)' : 'var(--subColor)'))
            .attr('width', (d) => widthFunc(d.value)),
        (update) =>
          update
            .transition()
            .duration(750)
            .attr('x', (d) => xPo(d.value))
            .attr('y', (d, i) => y(d.key) as number)
            .attr('fill', (d) => (d.value > 0 ? 'var(--mainColor)' : 'var(--subColor)'))
            .attr('width', (d) => widthFunc(d.value))
      )

    valueGroup
      .selectAll('text')
      .data(arr)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('dy', '1rem')
            .attr('x', _w - 5)
            .attr('y', (d, i) => y(d.key) as number)
            .text((d) => d.value.toLocaleString()),
        (update) => update.text((d) => d.value.toLocaleString()).attr('y', (d, i) => y(d.key) as number)
      )
  }

  return { updateChart }
}
