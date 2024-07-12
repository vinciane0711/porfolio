import * as d3 from 'd3'
import type { AreaFeature, FeatureType } from '@/types'

type M = FeatureType<{ name: string; description: string; station: string }>
const metroFunc = (svg: d3.Selection<any, any, any, any>, generator: d3.GeoPath) => {
  const group = svg.append('g')
  return function (data: any, color: string) {
    const [metroLine, ...metroStops] = data as M[]
    const metro = group.append('g')

    metro
      .append('path')
      .attr('d', () => generator(metroLine))
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1)

    metro
      .selectAll('circle')
      .data(metroStops)
      .join('circle')
      .attr('r', 2)
      .attr('cx', (d) => generator.centroid(d)[0])
      .attr('cy', (d) => generator.centroid(d)[1])
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .append('title')
      .text((d) => d.properties.name + d.properties.station)
  }
}

export const mapStyle = [
  {
    name: '主邊界',
    class: 'main',
    fill: 'transparent',
    opacity: 0,
    width: 1,
    color: '#dddddd',
  },
  {
    name: '副邊界',
    class: 'boundary',
    fill: 'none',
    opacity: 1,
    width: 1,
    color: '#bbbbbb',
  },
]

export const initMap = (
  el: HTMLElement,
  data: { main: AreaFeature[]; sub: any },
  range: [number, number] | [number, number, number],
  config = { width: 500, height: 500 }
) => {
  const svg = d3.select(el).attr('viewBox', [0, 0, config.width, config.height])
  const mainGroup = svg.select('.main')
  const boundary = svg.select('.boundary').append('path')
  const { main, sub } = data

  const projection = d3
    .geoEquirectangular()
    .fitSize([config.width, config.height], { type: 'FeatureCollection', features: main })
  const geoGenerator = d3.geoPath().projection(projection)

  boundary.datum(sub).attr('d', geoGenerator)

  const mainPath = mainGroup
    .selectAll('path')
    .data(main)
    .join('path')
    .attr('d', geoGenerator)
    .attr('fill', null)
    .attr('data-name', (d) => d.properties.VILLNAME || d.properties.TOWNNAME || d.properties.COUNTYNAME)
    .attr('data-id', (d) => d.properties.VILLCODE || d.properties.TOWNCODE || d.properties.COUNTYCODE)

  const _r = range.length === 2 ? ['white', 'orange'] : ['blue', 'white', 'orange']
  const colorFunc = d3.scaleLinear(range, _r)

  function update(obj: Record<string, number>) {
    const color = (d: AreaFeature) => {
      const { COUNTYCODE, TOWNCODE, VILLCODE } = d.properties
      const cntValue = obj[VILLCODE] || obj[TOWNCODE] || obj[COUNTYCODE]
      return cntValue ? colorFunc(cntValue) : null
    }

    mainPath.call((f) => {
      f.transition().attr('fill', (d) => color(d))
    })
  }

  return { update, drawMetro: metroFunc(svg, geoGenerator) }
}
