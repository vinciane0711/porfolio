import * as d3 from 'd3'
import county_map from '@/assets/data/map/county.json'
import town_map from '@/assets/data/map/town.json'
import type { AreaFeature } from '@/types'
import { useStore } from '@/stores/main'
import { topoFunc, getMapChunk } from '@/composables'

const width = 500
const height = 500
const store = useStore()
const _countyList = topoFunc.convert(county_map, county_map.objects.counties)
const _townList = topoFunc.convert(town_map, town_map.objects.towns)

const getMapSource = async () => {
  switch (store.selectLevel) {
    case 'county':
      const c = topoFunc.merge(county_map, county_map.objects.counties.geometries)
      return { main: _countyList.features, sub: c }
    case 'countyDetail':
      const d = topoFunc.mesh(county_map, county_map.objects.counties)
      return { main: _townList.features, sub: d }
    case 'town':
      const _m = _townList.features.filter((a) => a.properties.COUNTYNAME === store.cntCounty)!
      const _s = _countyList.features.find((a) => a.properties.COUNTYNAME === store.cntCounty)!
      return { main: _m, sub: _s }
    case 'village':
      const countyCode = store.adminMap.get(store.cntCounty)!
      const { main, sub } = await getMapChunk([{ code: countyCode, towns: store.cntTown }])
      return { main, sub }
  }
}

export const initMap = async (el: HTMLElement) => {
  const svg = d3.select(el).attr('viewBox', [0, 0, width, height])
  const mainGroup = svg.select('.main')
  const boundary = svg.select('.boundary').append('path')
  const textGroup = svg.select('.text')

  const { main, sub } = await getMapSource()
  const projection = d3.geoEquirectangular().fitSize([width, height], { type: 'FeatureCollection', features: main })
  const geoGenerator = d3.geoPath().projection(projection)

  boundary.datum(sub).attr('d', geoGenerator)
  const mainPath = mainGroup
    .selectAll('path')
    .data(main)
    .join('path')
    .attr('d', geoGenerator)
    .attr('data-name', (d) => d.properties.VILLNAME || d.properties.TOWNNAME || d.properties.COUNTYNAME)
    .attr('data-id', (d) => d.properties.VILLCODE || d.properties.TOWNCODE || d.properties.COUNTYCODE)
    .attr('fill', null)

  // textGroup
  //   .selectAll('texts')
  //   .data(main)
  //   .join('text')
  //   .attr('x', (d) => geoGenerator.centroid(d)[0])
  //   .attr('y', (d) => geoGenerator.centroid(d)[1])
  //   .text((d) => d.properties.VILLNAME || d.properties.TOWNNAME || d.properties.COUNTYNAME)

  function updateColor(obj: Record<string, number>) {
    let theme = ['blue', 'white', 'orange']
    let r = [...store.range]

    if (r[0] >= 0 && r[1] > 0) {
      theme = ['white', 'orange']
    } else if (r[0] < 0 && r[1] <= 0) {
      theme = ['blue', 'white']
    } else {
      r.splice(1, 0, 0)
    }

    const colorFunc = d3.scaleLinear(r, theme)
    const color = (d: AreaFeature) => {
      const { COUNTYCODE: _county, TOWNCODE: _town, VILLCODE: _village, NOTE } = d.properties
      const cntValue = obj[_county] || obj[_town] || obj[_village] || (NOTE && obj[NOTE])
      return cntValue ? colorFunc(cntValue) : null
    }

    mainPath.call((f) => {
      f.attr('fill', (d) => color(d))
    })
  }
  return { updateColor }
}
