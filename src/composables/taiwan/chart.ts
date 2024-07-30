import * as d3 from 'd3'

const cityObj = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
]

const margin = { top: 30, right: 10, bottom: 0, left: 10 }
const barSize = 30
const n = cityObj.length
const width = 350
const _h = barSize * n
const height = _h + margin.top + margin.bottom
const _w = width - margin.left - margin.right

export const initChart = (func: (...arg: any) => void) => {
  const barChart = d3
    .select('#chart')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', '100%')
    // .attr('height', _h)
    .attr('font-size', '1rem')

  const x = d3.scaleLinear().rangeRound([0, _w])
  const y = d3.scaleBand().rangeRound([0, _h]).padding(0.2).domain(cityObj)

  const contentWrap = barChart
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
  const barsGroup = contentWrap.append('g')
  const textGroup = contentWrap.append('g')
  const labelGroup = contentWrap.append('g')
  const valueGroup = contentWrap.append('g').attr('text-anchor', 'end')
  const zeroLine = contentWrap
    .append('line')
    .attr('y1', 0)
    .attr('y2', _h)
    .attr('stroke', 'lightGray')
    .attr('stroke-dasharray', '4 3')

  textGroup
    .selectAll('text')
    .data(cityObj)
    .join('text')
    .attr('dy', '1rem')
    .attr('x', 0)
    .attr('y', (d) => y(d) as number)
    .text((d) => d)

  labelGroup
    .selectAll('rect')
    .data(cityObj)
    .join('rect')
    .attr('x', -2)
    .attr('y', (d) => y(d) as number)
    .attr('height', y.bandwidth())
    .attr('width', _w + 2)
    .attr('fill', 'transparent')
    .attr('cursor', 'pointer')
    .attr('data-city', (d) => d)
    .on('click', (e, d) => func(d))

  function axis() {
    const g = contentWrap.append('g')
    const axis = d3.axisTop(x).ticks(5, '~s').tickSizeOuter(0)
    return () => g.transition().call(axis)
  }

  const updateAxis = axis()

  function selectCity(id: string) {
    // cityLabelGroup.select('rect').attr('stroke', '')
    // cityLabelGroup.select(`rect[data-city="${id}"]`).attr('stroke', 'gray')
  }

  let xPo = (d: number) => x(0)
  let widthFunc = (d: number) => {
    return _w
  }

  function updateRange(range: [number, number]) {
    x.domain(range)
    updateAxis()
    zeroLine.transition().attr('x1', x(0)).attr('x2', x(0))

    xPo = (d: number) => (d > 0 ? x(0) : x(d) < 0 ? 0 : x(d))
    widthFunc = (d: number) => {
      const w = range.includes(0) ? _w : _w / 2
      const diff = Math.abs(x(d) - x(0))
      return diff >= w ? w : diff
    }
  }

  function updateChart(data: { [city: string]: number }) {
    barsGroup
      .selectAll('rect')
      .data(cityObj)
      .join(
        (enter) =>
          enter
            .append('rect')
            .attr('opacity', 0.2)
            .attr('height', y.bandwidth())
            .attr('y', (d) => y(d) as number)
            .attr('x', (d) => xPo(data[d]))
            .attr('fill', (d) =>
              data[d] > 0 ? 'var(--mainColor)' : 'var(--subColor)'
            )
            .attr('width', (d) => widthFunc(data[d])),
        (update) =>
          update
            .transition()
            .duration(750)
            .attr('x', (d) => xPo(data[d]))
            .attr('fill', (d) =>
              data[d] > 0 ? 'var(--mainColor)' : 'var(--subColor)'
            )
            .attr('width', (d) => widthFunc(data[d]))
      )

    valueGroup
      .selectAll('text')
      .data(cityObj)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('dy', '1rem')
            .attr('x', _w)
            .attr('y', (d) => y(d) as number)
            .text((d) => data[d].toLocaleString()),
        (update) => update.text((d) => data[d].toLocaleString())
      )
  }

  return { updateRange, updateChart, selectCity }
}
