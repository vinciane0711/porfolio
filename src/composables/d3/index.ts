import { ref, computed, reactive, watch } from 'vue'
import * as d3 from 'd3'
// TODO: change map data source to ./map/chunk/~.json
import tpi from '@/assets/data/cities/data.json'
import pop from '@/assets/data/cities/test.json'
import redevelopment from '@/assets/data/cities/subArea.json'
import type { Feature, FeatureCollection } from 'geojson'
import rewind from '@turf/rewind'
import { topoFunc } from '@/composables'

type D3Selection = d3.Selection<any, any, any, any>

export enum AdminLevel {
  city = '4',
  county = '7',
  village = '9',
}

const width = 1000
const height = 800

const popMap = new Map(
  pop.map((d) => {
    const _i = typeof d.id === 'number' ? d.id.toString() : d.id
    return [_i, d]
  })
)

const defaultInfo: {
  level?: AdminLevel
  id: string
  name: string
} = {
  level: undefined,
  id: 'total',
  name: '北北桃',
}

const defaultState = { city: '', cityId: '', county: '', countyId: '', village: '', villageId: '' }

export const info = reactive({ ...defaultInfo })
export const ttt = reactive({ ...defaultState })
export const cntPop = computed(() => popMap.get(info.id)!.pop as number)

export const updateInfo = (obj?: { level: AdminLevel; id: string; name: string }) => {
  if (obj) {
    switch (obj.level) {
      case AdminLevel.city:
        ttt.city = obj.name
        ttt.cityId = obj.id
        ttt.county = ''
        ttt.countyId = ''
        ttt.village = ''
        ttt.villageId = ''
        break
      case AdminLevel.county:
        ttt.county = obj.name
        ttt.countyId = obj.id
        ttt.village = ''
        ttt.villageId = ''
        break
      case AdminLevel.village:
        ttt.village = obj.name
        ttt.villageId = obj.id
        break
    }
    Object.assign(info, obj)
  } else {
    Object.assign(ttt, defaultState)
    Object.assign(info, defaultInfo)
  }
}

const geoData = () => {
  const _d = topoFunc.convert(tpi, tpi.objects.cities)
  const adminAreas = d3.group(_d.features as Feature[], (d) => d.properties!.admin_level)

  const cities = adminAreas.get(AdminLevel.city) as Feature[]
  const counties = adminAreas.get(AdminLevel.county) as Feature[]
  const villages = adminAreas.get(AdminLevel.village) as Feature[]

  const geoMap = new Map(
    _d.features.map((d: Feature) => {
      const _i = d.properties!.nat_ref
      return [_i, d]
    })
  )

  return {
    cities,
    counties,
    villages,
    geoMap,
  }
}

const initMap = (data: Feature[]) => {
  // get the svg element and define viewBox
  // TODO: add svg padding
  const svg = d3.select('#map').attr('viewBox', [0, 0, width, height]).attr('stroke-linejoin', 'round')

  // get map boundary; use projection.fitSize()
  const projection = d3.geoEquirectangular().fitSize([width, height], { type: 'FeatureCollection', features: data })
  const geoGenerator = d3.geoPath().projection(projection)

  // create map container
  const wrapper = svg.append('g')

  // set zoom in scale
  const zoom = d3.zoom().scaleExtent([1, 5])
  svg.call(zoom as any).on('wheel.zoom', null)

  return {
    svg,
    wrapper,
    zoom,
    geoGenerator,
  }
}

export const initD3 = () => {
  const { cities, counties, villages, geoMap } = geoData()
  const { svg, wrapper, zoom, geoGenerator } = initMap(cities)
  const { updateChart } = initBarChart()

  const color = d3.scaleSequential([0, 0.5], d3.interpolateBlues)

  // create different admin_level groups
  const cityGroup = wrapper.append('g').attr('class', 'cities_group')
  const countyGroup = wrapper.append('g').attr('class', 'county_group')
  const villageGroup = wrapper.append('g').attr('class', 'village_group')
  const outline = wrapper.append('path').attr('class', 'area_outline').attr('fill', 'none')
  const reDevArea = wrapper.append('g').attr('class', 'redevelop').style('display', 'none')
  const rrr = reDevArea.append('path').attr('stroke', 'pink').attr('fill', 'pink').attr('fill-opacity', 0.3)

  const tooltip = d3.select('.tooltip')

  svg.on('click', () => updateInfo())
  zoom.on('zoom', zoomed)
  drawArea(cityGroup, cities, 10000000)

  const rewindData = rewind(redevelopment as any, { reverse: true }) as FeatureCollection
  const dots = reDevArea
    .selectAll()
    .data(rewindData.features)
    .join('circle')
    .attr('data-sid', (d) => d.properties!.id)
    .attr('transform', (d) => `translate(${geoGenerator.centroid(d)})`)
    .attr('stroke', 'pink')
    .attr('r', 3)
    .attr('fill', 'white')
    .attr('fill-opacity', 0.5)
    .on('mouseenter', (e: MouseEvent, d) => {
      tooltip.style('opacity', 1).html(`${d.properties!.name}`)
      rrr.attr('d', geoGenerator(d))
    })
    .on('click', (e) => {
      e.stopPropagation()
    })

  rrr
    .on('mouseout', () => {
      rrr.attr('d', null)
    })
    .on('mousemove', (e, d) => {
      tooltip.style('top', e.pageY - 10 + 'px').style('left', e.pageX + 'px')
    })
    .on('click', (e) => {
      e.stopPropagation()
    })

  function drawDetail(_l: AdminLevel, _i: string) {
    if (_l === AdminLevel.village) return

    const obj = {
      '4': { el: countyGroup, data: counties, base: 1000000 },
      '7': { el: villageGroup, data: villages, base: 30000 },
    }
    const _f = obj[_l].data.filter((f) => f.properties!.nat_ref.slice(0, _i.length) === _i)

    let county: Feature | undefined = undefined
    if (_l === AdminLevel.county) {
      county = counties.find((_c) => _c.properties?.nat_ref === _i)
    }

    drawArea(obj[_l].el, _f, obj[_l].base, county)
  }

  function drawArea(el: D3Selection, data: Feature[], base: number, county?: Feature) {
    updateChart(data)

    if (county) {
      data.unshift(county)
    }

    el.selectAll('path')
      .data(data)
      .join('path')
      .attr('fill', (d, i) => {
        const id = d.properties!.nat_ref as string
        const v = popMap.get(id)
        if (county && i === 0) return 'darkTurquoise'
        return color(v!.pop / base)
      })
      .attr('d', (d) => geoGenerator(d))
      .on('click', (e, d) => {
        const { name, nat_ref, admin_level } = d.properties as any
        updateInfo({
          level: admin_level,
          id: nat_ref,
          name: name,
        })

        e.stopPropagation()
      })
      .on('mouseenter', (e, d) => {
        tooltip.style('opacity', 1).html(`${d.properties!.name}`)
      })
      .on('mousemove', (e, d) => {
        tooltip.style('top', e.pageY - 10 + 'px').style('left', e.pageX + 'px')
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0)
      })
  }

  function reset() {
    updateChart(cities)
    cityGroup.transition().style('fill', null)
    outline.attr('d', '')
    countyGroup.selectAll('path').remove()
    villageGroup.selectAll('path').remove()
    reDevArea.style('display', 'none')

    svg
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity, d3.zoomTransform(svg.node()).invert([width / 2, height / 2]))
  }

  function updateMap(data: any) {
    const _i = data.properties.nat_ref as string
    const _l = data.properties.admin_level as AdminLevel

    reDevArea.style('display', _l === AdminLevel.city ? 'none' : 'block')
    updateBoundary(_l, data)
    drawDetail(_l, _i)
  }

  function zoomed(event: any) {
    const { transform } = event
    wrapper.attr('transform', transform)
    wrapper.attr('stroke-width', 1 / transform.k)
    outline.attr('stroke-width', 3 / transform.k)
    dots.attr('r', 4 / transform.k)
  }

  function updateBoundary(_l: AdminLevel, geoData: any) {
    const [[x0, y0], [x1, y1]] = geoGenerator.bounds(geoData)

    if (_l === AdminLevel.city) villageGroup.selectAll('path').remove()

    outline.transition().style('stroke', null)
    outline
      .datum(geoData)
      .attr('d', (d) => geoGenerator(d))
      .transition()
      .style('stroke', 'yellow')

    if (_l === AdminLevel.village) return

    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(Math.min(9, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
      )
  }

  watch(info, () => {
    if (!info.level) return reset()
    const _d = geoMap.get(info.id)
    updateMap(_d)

    d3.selectAll('[data-id]').attr('style', 'none')
    d3.select(`[data-id="${info.id}"]`).style('fill', 'turquoise')
  })
}

function initBarChart() {
  const w = 400
  const marginLeft = 50

  const svg = d3.select('#chart')
  const rectBars = svg.append('g').attr('fill', 'lightGray')
  const labels = svg.append('g').attr('transform', `translate(${marginLeft},0)`)
  const values = svg.append('g').attr('transform', 'translate(5,0)')

  function updateChart(rawData: any[]) {
    const data = rawData.map((_f) => {
      const id = _f.properties!.nat_ref as string
      const _d = popMap.get(id)
      return { name: _d!.name, id, value: _d!.pop, level: _d!.level }
    })

    const h = data.length * 30
    svg.attr('viewBox', [0, 0, w, h])

    const sortData = d3.sort(data, (d) => d.value)

    const y = d3
      .scaleBand()
      .domain(sortData.map((s) => s.name))
      .range([h, 0])
      .padding(0.3)

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([marginLeft, w])

    rectBars
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('data-id', (d) => d.id)
      .attr('y', (d) => y(d.name) as number)
      .attr('x', x(0))
      .attr('width', (d) => x(d.value) - x(0))
      .attr('height', y.bandwidth())
      .on('click', (e, d) => {
        updateInfo({
          level: d.level!.toString() as AdminLevel,
          id: d.id,
          name: d.name,
        })

        e.stopPropagation()
      })

    values
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('x', x(0))
      .attr('y', (d) => (y(d.name) as number) + y.bandwidth() / 2)
      .attr('dy', '0.35rem')
      .text((d) => `${d.value.toLocaleString('en-US')} (${((d.value / cntPop.value) * 100).toFixed(2)}%)`)

    labels
      .call(d3.axisLeft(y).tickSize(0).tickPadding(5))
      .call((g) => g.select('.domain').remove())
      .attr('font-size', 14)
  }

  return { updateChart }
}
