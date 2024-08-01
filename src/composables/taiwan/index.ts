import * as d3 from 'd3'
import { topoFunc } from '@/composables'
import { createLegend } from '@/composables/taiwan/legend'
import taiwanMap from '@/assets/data/map/taiwan_main.json'

const width = 500
const height = 800

const csvConvertor = async (path: string) =>
  await d3.text(path).then((res) => d3.csvParseRows(res))

export type DiffType = 'POP' | 'NATIVE' | 'SOCIAL'

export const views: Record<
  DiffType,
  {
    title: string
    cols: string[]
    range: [[number, number], [number, number], [number, number]]
  }
> = {
  POP: {
    title: '人口增加',
    cols: ['自然增加', '社會增加'],
    range: [
      [-30000, 30000],
      [-30000, 30000],
      [-50000, 50000],
    ],
  },
  NATIVE: {
    title: '自然增加',
    cols: ['出生人數', '死亡人數'],
    range: [
      [0, 30000],
      [-30000, 0],
      [-30000, 30000],
    ],
  },
  SOCIAL: {
    title: '社會增加',
    cols: ['遷入人數', '遷出人數'],
    range: [
      [0, 200000],
      [-200000, 0],
      [-50000, 50000],
    ],
  },
}

const admin_code = {
  新北市: '65000',
  臺北市: '63000',
  桃園市: '68000',
  臺中市: '66000',
  臺南市: '67000',
  高雄市: '64000',
  宜蘭縣: '10002',
  新竹縣: '10004',
  苗栗縣: '10005',
  彰化縣: '10007',
  南投縣: '10008',
  雲林縣: '10009',
  嘉義縣: '10010',
  屏東縣: '10013',
  臺東縣: '10014',
  花蓮縣: '10015',
  澎湖縣: '10016',
  基隆市: '10017',
  新竹市: '10018',
  嘉義市: '10020',
  金門縣: '09020',
  連江縣: '09007',
} as any

export interface IBaseType {
  city: string
  birth: number
  death: number
  nativeRate: number
  moveIn: number
  moveOut: number
  socialRate: number
  popRate: number
}

interface ISumData {
  [year: string]: IBaseType[]
}

export function diffFunc(type: DiffType, obj: IBaseType) {
  const { birth, death, moveIn, moveOut, socialRate, nativeRate, popRate } = obj
  const nativeDiff = birth - death
  const socialDiff = moveIn - moveOut
  const popDiff = nativeDiff + socialDiff

  switch (type) {
    case 'NATIVE':
      return [birth, -death, nativeDiff, nativeRate]
    case 'SOCIAL':
      return [moveIn, -moveOut, socialDiff, socialRate]
    case 'POP':
      return [nativeDiff, socialDiff, popDiff, popRate]
  }
}

// TODO: fetch data from google sheet
export const sumData: ISumData = await Promise.all(
  [
    'birth',
    'death',
    'moveIn',
    'moveOut',
    'nativeRate',
    'socialRate',
    'popRate',
  ].map((k) => csvConvertor(`./data/${k}.csv`))
).then((res) => {
  const [birth, death, moveIn, moveOut, nativeRate, socialRate, popRate] = res
  const years = birth[0]
  const cities = birth.length
  const result: ISumData = {}

  for (let i = 1; i < years.length; i++) {
    result[years[i]] = []
    for (let j = 1; j < cities; j++) {
      const city = birth[j][0]
      result[years[i]].push({
        city,
        birth: +birth[j][i],
        death: +death[j][i],
        nativeRate: +nativeRate[j][i],
        moveIn: +moveIn[j][i],
        moveOut: +moveOut[j][i],
        socialRate: +socialRate[j][i],
        popRate: +popRate[j][i],
      })
    }
  }

  return result
})

export interface ICsvObj<T> {
  keys: string[]
  rows: T[][]
}

export const taiwanData: Record<DiffType, ICsvObj<number>> = await Promise.all(
  ['popIncrement', 'nativeIncrement', 'socialIncrement'].map((k) =>
    csvConvertor(`./data/${k}.csv`)
  )
).then((res) => {
  const [pop, native, social] = res.map((r) => {
    const obj: ICsvObj<number> = { keys: [], rows: [] }
    for (const m of r) {
      const _k = m.shift()!
      const r = m.map((r) => +r)
      obj.keys.push(_k)
      obj.rows.push(r)
    }
    return obj
  })

  return { POP: pop, NATIVE: native, SOCIAL: social }
})

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
    cityGroup
      .select(`path[data-city="${id}"]`)
      .attr('filter', 'url(#shadow)')
      .attr('stroke', 'gray')
      .raise()
  }

  // const legendWrap = svg.append('g').attr('transform', `translate(${width - 200},${height - 80})`)
  // createLegend(legendWrap, colorFunc, { title: '單位（人)', width: 200, tickFormat: '~s' })

  const colorFunc = d3.scaleLinear(
    [-25000, 0, 25000],
    ['blue', 'white', 'orange']
  )

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
