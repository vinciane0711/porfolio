import * as d3 from 'd3'
import { useStore } from '@/stores/main'
import { strToNum } from '@/composables'

export interface IFileData {
  name: string
  head: string[]
  data: string[][]
  needParsed: boolean
  prefix: string
}

export const formRelation = {
  none: '單一表格',
  add: '相加 (A+B)',
  minus: '相減 (A-B)',
} as const

export type FormRel = keyof typeof formRelation

const store = useStore()

export const buildData = (mainData: IFileData, sub?: { rel: 'add' | 'minus'; file: IFileData }) => {
  const { needParsed, prefix, data } = mainData
  const totalValues: number[] = []
  const rows: string[] = []
  const parsedRows: string[] = []
  const dataByYear: { [year: string]: number }[] = []

  data.forEach((row, i) => {
    // find corresponded place-id or place-name
    const [_k, ...rest] = row
    const _p = store.getPlaceName(needParsed, prefix + _k)

    if (!_p) {
      alert('請檢查地區是否轉碼!')
      throw new Error('無法辨識區域名稱')
    }
    const id = needParsed ? _p : _k
    const name = needParsed ? _k : _p

    rows.push(name)
    parsedRows.push(id)

    const val = (v: string, j: number) => {
      if (sub) {
        const func = sub.rel === 'add' ? (a: number, b: number) => a + b : (a: number, b: number) => a - b
        const b = sub.file.data[i][j + 1]
        return func(strToNum(v), strToNum(b))
      } else {
        return strToNum(v)
      }
    }

    rest.forEach((v, j) => {
      const _v = val(v, j)
      totalValues.push(_v)

      if (dataByYear[j]) {
        dataByYear[j][id] = _v
      } else {
        dataByYear[j] = { [id]: _v }
      }
    })
  })

  const range = d3.extent(totalValues) as [number, number]
  const dataSum = dataByYear.reduce((acc, y) => {
    const _v = Object.values(y)
    acc.push(d3.sum(_v))
    return acc
  }, [] as number[])

  return {
    rows,
    parsedRows,
    dataByYear,
    dataSum,
    range,
  }
}
