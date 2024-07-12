import * as d3 from 'd3'

type KeyframeType = Record<
  string,
  { id: string; name: string; rank: number; color: string; value: number; preValue: number }
>

export const initBarChart = (
  el: HTMLElement,
  dataKeys: string[],
  range: [number, number],
  config = {
    width: 400,
    barSize: 20,
  }
) => {
  const margin = { top: 30, right: 15, bottom: 15, left: 15 }
  const height = config.barSize * dataKeys.length
  const _w = config.width - margin.left - margin.right
  const _h = height - margin.top - margin.bottom

  const x = d3.scaleLinear().rangeRound([0, _w]).domain(range)
  const y = d3.scaleBand<number>().range([0, _h]).domain(d3.range(dataKeys.length)).padding(0.2)

  const svg = d3.select(el).attr('viewBox', [0, 0, config.width, height])
  const contentGroup = svg.append('g').attr('transform', 'translate(15, 30)')
  const rectGroup = contentGroup.append('g')
  const textGroup = contentGroup.append('g')
  const valueGroup = contentGroup.append('g').attr('text-anchor', 'end')
  const zeroLine = contentGroup
    .append('line')
    .attr('stroke', 'lightGray')
    .attr('stroke-dasharray', '4 3')
    .attr('y1', 0)
    .attr('y2', _h)

  contentGroup.append('g').call(d3.axisTop(x).ticks(5, '~s').tickSizeOuter(0))

  const base = 0
  const basePo = x(base)
  const xPo = (d: number) => (d > 0 ? basePo : x(d) < 0 ? 0 : x(d))
  zeroLine.transition().attr('x1', basePo).attr('x2', basePo)

  const widthFunc = (d: number) => {
    const diff = Math.abs(x(d) - basePo)
    return diff >= _w ? _w : diff
  }

  const formatNumber = d3.format(',d')

  function updateChart(data: KeyframeType) {
    rectGroup
      .selectAll('rect')
      .data(dataKeys)
      .join(
        (enter) =>
          enter
            .append('rect')
            .attr('height', y.bandwidth())
            .attr('y', (d) => y(data[d].rank) as number)
            .attr('x', (d) => xPo(data[d].value))
            .attr('fill', (d) => data[d].color)
            .attr('width', (d) => widthFunc(data[d].value)),
        (update) =>
          update
            .transition()
            .duration(1000)
            .attr('x', (d) => xPo(data[d].value))
            .attr('y', (d, i) => y(data[d].rank) as number)
            .attr('width', (d) => widthFunc(data[d].value))
      )

    textGroup
      .selectAll('text')
      .data(dataKeys)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('dy', '0.75rem')
            .attr('x', 5)
            .attr('y', (d) => y(data[d].rank) as number)
            .text((d) => data[d].name),
        (update) =>
          update
            .transition()
            .duration(1000)
            .attr('y', (d) => y(data[d].rank) as number)
      )
    valueGroup
      .selectAll('text')
      .data(dataKeys)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('dy', '0.75rem')
            .attr('x', _w - 5)
            .attr('y', (d) => y(data[d].rank) as number)
            .text((d) => data[d].value.toLocaleString()),
        (update) =>
          update
            .transition()
            .textTween(function (d) {
              const i = d3.interpolateNumber(data[d].preValue, data[d].value)
              return function (t) {
                return formatNumber((this!._current = i(t)))
              }
            })
            .duration(1000)
            .attr('y', (d) => y(data[d].rank) as number)
      )
  }

  return { updateChart }
}
