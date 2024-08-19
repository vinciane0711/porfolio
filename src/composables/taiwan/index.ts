import * as d3 from 'd3'

export interface ICsvObj {
  keys: string[]
  rows: number[][]
}
export const cityList = [
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

// TODO: fetch data from google sheet
export const sumData = await Promise.all(
  [
    'birth',
    'death',
    'moveIn',
    'moveOut',
    'nativeRate',
    'socialRate',
    'popRate',
  ].map((k) => csvConvertor(`./data/cities/${k}.csv`))
).then((res) => {
  const [birth, death, moveIn, moveOut, nativeRate, socialRate, popRate] = res
  const years = birth[0]
  const cities = birth.length
  const result = []

  for (let i = 1; i < years.length; i++) {
    for (let j = 1; j < cities; j++) {
      const city = birth[j][0]
      const _birth = +birth[j][i]
      const _death = +death[j][i]
      const _moveIn = +moveIn[j][i]
      const _moveOut = +moveOut[j][i]
      const nativeDiff = _birth - _death
      const socialDiff = _moveIn - _moveOut
      const popDiff = nativeDiff + socialDiff

      result.push({
        year: years[i],
        city,
        NATIVE: [_birth, _death, nativeDiff, +nativeRate[j][i]],
        SOCIAL: [_moveIn, _moveOut, socialDiff, +socialRate[j][i]],
        POP: [nativeDiff, socialDiff, popDiff, +popRate[j][i]],
      })
    }
  }

  return result
})

export const sortedData = sumData.reduce(
  (acc, cnt) => {
    const { year, city } = cnt
    for (let i in [0, 1, 2]) {
      for (let j of ['NATIVE', 'SOCIAL', 'POP'] as DiffType[]) {
        const n = j !== 'POP' && i === '1' ? -1 : 1
        const _d = cnt[j][i] * n
        if (acc[j][i]) {
          if (acc[j][i][year]) {
            acc[j][i][year][city] = _d
          } else {
            acc[j][i][year] = { [city]: _d }
          }
        } else {
          acc[j][i] = { [year]: { [city]: _d } }
        }
      }
    }
    return acc
  },
  {
    NATIVE: [],
    SOCIAL: [],
    POP: [],
  } as Record<DiffType, any[]>
)

export const taiwanData: Record<DiffType, ICsvObj> = await Promise.all(
  ['popIncrement', 'nativeIncrement', 'socialIncrement'].map((k) =>
    csvConvertor(`./data/taiwan/${k}.csv`)
  )
).then((res) => {
  const [pop, native, social] = res.map((r) => {
    const obj: ICsvObj = { keys: [], rows: [] }
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
