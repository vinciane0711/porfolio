import * as d3 from 'd3'
import { strToNum } from '@/composables'
import { useStore } from '@/stores/main'

const store = useStore()

type KeyframeType = Record<
  string,
  {
    id: string
    name: string
    rank: number
    color: string
    value: number
    preValue: number
  }
>

const taipei = {
  code: '63000',
  towns: [
    '萬華區',
    '中正區',
    '信義區',
    '南港區',
    '文山區',
    '大安區',
    '中山區',
    '松山區',
    '士林區',
    '大同區',
    '內湖區',
    '北投區',
  ],
}
const newTaipei = {
  code: '65000',
  towns: [
    '板橋區',
    '三重區',
    '中和區',
    '永和區',
    '新莊區',
    '新店區',
    '樹林區',
    '鶯歌區',
    '三峽區',
    '淡水區',
    '土城區',
    '蘆洲區',
    '五股區',
    '泰山區',
    '林口區',
    '八里區',
    // '汐止區',
    // '瑞芳區',
    // '深坑區',
    // '石碇區',
    // '坪林區',
    // '三芝區',
    // '石門區',
    // '平溪區',
    // '雙溪區',
    // '貢寮區',
    // '金山區',
    // '萬里區',
    // '烏來區',
  ],
}
const taoyuan = {
  code: '68000',
  towns: [
    '桃園區',
    '中壢區',
    '楊梅區',
    '蘆竹區',
    '大園區',
    '龜山區',
    '八德區',
    '平鎮區',
    '觀音區',
    '大溪區',
    '龍潭區',
    '新屋區',
    // '復興區',
  ],
}

const list = [
  '65000050002',
  '65000050053',
  '65000050064',
  '65000090027',
  '65000100012',
  '65000100042',
  '65000100008',
  '65000150018',
  '65000170003',
  '65000170007',
  '65000170008',
  '68000010010',
  '68000010030',
  '68000010050',
  '68000020032',
  '68000020043',
  '68000040027',
  '68000060019',
  '68000070010',
  '68000070031',
]
export const arr = [
  // taipei,
  newTaipei,
  taoyuan,
]

const csvConvertor = async (path: string) =>
  await d3.text(path).then((res) => {
    const [head, ...data] = d3.csvParseRows(res)
    return {
      head,
      data,
    }
  })

const colorList = {
  65000050: 'GreenYellow',
  65000090: 'Salmon',
  65000100: 'Turquoise',
  65000170: 'CornflowerBlue',
  68000010: 'Wheat',
  68000020: 'LightSteelBlue',
  68000060: 'Yellow',
  68000070: 'HotPink',
}

function rank(
  ids: string[],
  obj: Record<string, number>,
  preObj: Record<string, number>
) {
  const data = Array.from(ids, (id) => ({
    id,
    name: store.getPlaceName(false, id)!,
    value: obj[id],
    preValue: preObj[id],
    rank: 0,
  }))
  data.sort((a, b) => d3.descending(a.value, b.value))
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(60, i)

  const d = data.reduce((acc, cnt) => {
    const id = cnt.id
    const countyId = id.slice(0, 8) as unknown as keyof typeof colorList
    acc[id] = {
      color: colorList[countyId] || 'LightGray',
      ...cnt,
    }
    return acc
  }, {} as KeyframeType)

  return d
}

export const buildData = async () => {
  let years: string[] = []
  const keys: string[] = []
  const dataByYear: { [id: string]: number }[] = []
  const multiLineData: number[][] = []
  const temp: { [id: string]: number }[] = []
  const keyframes: KeyframeType[] = []

  const promises = [
    // './data/cities/65_pop.csv',
    // './data/cities/68_pop.csv',
    // './data/cities/63_pop.csv',
    './data/cities/65_household.csv',
    './data/cities/68_household.csv',
  ].map((p) => csvConvertor(p))

  await Promise.all(promises).then((rest) => {
    rest[0].head.splice(0, 2)
    years = rest[0].head

    rest
      .map((r) => r.data)
      .flat()
      .forEach((row) => {
        const [_k, ...rest] = row
        keys.push(_k)

        const _r = rest.map((n) => strToNum(n))
        const base = strToNum(rest[0])

        if (list.includes(_k)) multiLineData.push(_r)

        // TODO:
        _r.forEach((v, i) => {
          const _v = v - base
          if (dataByYear[i]) {
            dataByYear[i][_k] = _v
          } else {
            dataByYear[i] = { [_k]: _v }
          }

          if (list.includes(_k)) {
            if (temp[i]) {
              temp[i][_k] = _v
            } else {
              temp[i] = { [_k]: _v }
            }
          }
        })
      })

    for (let i = 0; i < temp.length - 1; i++) {
      keyframes.push(rank(list, temp[i + 1], temp[i]))
    }
  })

  return {
    tempKeys: list,
    keys,
    years,
    multiLineData,
    dataByYear,
    keyframes,
  }
}
