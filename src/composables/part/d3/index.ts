import * as d3 from 'd3'

const csvConvertor = async (path: string) =>
  await d3.text(path).then((res) => {
    const [head, ...data] = d3.csvParseRows(res)
    return {
      head,
      data,
    }
  })
