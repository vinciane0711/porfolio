import * as d3 from 'd3'
import { topoFunc } from '@/composables'
import { createLegend } from '@/composables/taiwan/legend'
import taiwanMap from '@/assets/data/map/taiwan_main.json'

const width = 500
const height = 800

export const initMap = (el: HTMLElement, func: (...arg: any) => void) => {
  const _d = topoFunc.convert<{
    id: string
    code: string
    name_zh: string
    name_en: string
  }>(taiwanMap, taiwanMap.objects.county)

  const svg = d3
    .select(el)
    .attr('viewBox', [0, 0, width, height])
    .attr('stroke-linejoin', 'round')
  const projection = d3
    .geoEquirectangular()
    .fitSize([width - 10 * 2, height - 10 * 2], _d)
  const geoGenerator = d3.geoPath().projection(projection)

  const cityGroup = svg
    .append('g')
    .attr('class', 'cities')
    .attr('fill', 'white')
    .attr('stroke', 'lightGray')
    .attr('stroke-width', '2')
    .attr('transform', 'translate(10,10)')

  const tooltip = d3.select('.tooltip')

  cityGroup
    .selectAll('path')
    .data(_d.features)
    .join('path')
    .attr('d', (d) => geoGenerator(d))
    .attr('data-city', (d) => d.properties!.name_zh)
    .on('mouseenter', (e, d) =>
      tooltip.style('opacity', 1).html(`${d.properties!.name_zh}`)
    )
    .on('mousemove', (e, d) =>
      tooltip.style('top', e.pageY - 10 + 'px').style('left', e.pageX + 'px')
    )
    .on('mouseout', () => tooltip.style('opacity', 0))
    .on('click', (e, d) => {
      const name = d.properties!.name_zh as string
      func(name)
      e.stopPropagation()
    })

  function selectCity(id: string) {
    cityGroup.selectAll('path').attr('filter', '').attr('stroke', '')

    if (!id) return
    cityGroup
      .select(`path[data-city="${id}"]`)
      .attr('filter', 'url(#shadow)')
      .attr('stroke', 'gray')
      .raise()
  }

  const colorFunc = d3.scaleLinear(
    [-25000, 0, 25000],
    ['blue', 'white', 'orange']
  )

  // const legendWrap = svg.append('g')
  // createLegend(legendWrap, colorFunc, {
  //   title: '單位（人)',
  //   width: 200,
  //   tickFormat: '~s',
  // })

  function updateRange(range: [number, number]) {
    const [min, max] = range
    if (min === 0) {
      colorFunc.domain(range).range(['white', 'orange'])
    } else if (max === 0) {
      colorFunc.domain(range).range(['blue', 'white'])
    } else {
      colorFunc.domain([min, 0, max]).range(['blue', 'white', 'orange'])
    }
  }

  function updateColor(data: { [city: string]: number }) {
    cityGroup
      .selectAll('path')
      .transition()
      .duration(750)
      .attr('fill', (d: any) => colorFunc(data[d.properties.name_zh]))
  }

  return { updateRange, updateColor, selectCity }
}
