import * as d3 from 'd3'

export const conf = {
  w: 400,
  h: 200,
  mt: 10,
  mb: 30,
  mx: 40,
}

type MatrixArray = [number, number][]
type SvgSelection = d3.Selection<HTMLElement, unknown, null, undefined>

export interface ICsvObj<T> {
  keys: string[]
  rows: T[][]
}

export const csvConvertor = async (path: string) => {
  return await d3.text(path).then((res) => {
    const rawData = d3.csvParseRows(res)
    const obj: ICsvObj<number> = { keys: [], rows: [] }

    for (const m of rawData) {
      const _k = m.shift()!
      const r = m.map((r) => +r)
      obj.keys.push(_k)
      obj.rows.push(r)
    }

    return obj
  })
}

export const initChart = (data: ICsvObj<number>) => {
  const copy = JSON.parse(JSON.stringify(data)) as ICsvObj<number>
  const { keys, rows } = copy
  const [years, ...rest] = rows
  const rate = rest.splice(rest.length - 1, 1)[0]
  const total = rest.splice(rest.length - 1, 1)[0]

  // remove key="year"
  keys.shift()
  // keys.push(keys.splice(index - 1, 1)[0])

  const numRange = d3.extent(rest.flat()) as number[]
  const x = d3.scaleLinear(d3.extent(years) as number[], [
    conf.mx,
    conf.w - conf.mx,
  ])
  const y = d3.scaleLinear(numRange, [conf.h - conf.mb, conf.mt])
  const y2 = d3.scaleLinear(d3.extent(rate) as number[], [
    conf.h - conf.mb,
    conf.mt,
  ])
  const y3 = d3.scaleLinear(d3.extent(total) as number[], [
    conf.h - conf.mb,
    conf.mt,
  ])

  const line = d3.line(
    (d) => x(d[0]),
    (d) => y(d[1])
  )

  const line2 = d3.line(
    (d) => x(d[0]),
    (d) => y2(d[1])
  )

  const line3 = d3.line(
    (d) => x(d[0]),
    (d) => y3(d[1])
  )


  const area = d3
    .area()
    .curve(d3.curveCardinal.tension(0.95))
    .x((d) => x(d[0]))
    .y0(conf.h - conf.mb)
    .y1((d) => y(d[1]))

  const transposeFunc = (r: number[]) => d3.transpose([years, r]) as MatrixArray

  const drawXAxis = (svg: SvgSelection) => {
    svg
      .select('.x-axis')
      .call(d3.axisBottom(x).ticks(conf.w / 40, ''))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('x2', conf.w - conf.mx * 2)
          .attr('transform', 'translate(-10,5) rotate(-40)')
      )
  }

  const drawYAxis = (svg: SvgSelection) => {
    svg
      .select('.y-axis1')
      // .call(d3.axisLeft(y).ticks(conf.h / 40))
      .call(d3.axisLeft(y).ticks(conf.h / 40, '~s'))
      .call((g) => g.selectAll('.tick line').attr('stroke-opacity', '0.3'))
      .call((g) =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('x2', conf.w - conf.mx * 2)
          .attr('stroke-opacity', 0.1)
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.append('text').attr('x', -conf.mx).attr('y', 10))

    svg
      .select('.y-axis2')
      .call(
        d3.axisRight(y3).ticks(conf.h / 40, '~s')
        // .tickFormat(d3.format('.' + d3.precisionFixed(1) + '%'))
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke-opacity', '0.3'))
      .call((g) => g.append('text').attr('x', -conf.mx).attr('y', 10))

    // divider for separating positive & negative value
    // const zeroPo = y2(0)
    // if (zeroPo > 0 && zeroPo < conf.h - conf.mt - conf.mb) {
    //   svg
    //     .select('.y-axis2')
    //     .append('line')
    //     .attr('stroke', 'red')
    //     .attr('stroke-opacity', 0.3)
    //     .attr('x1', 0)
    //     .attr('x2', -(conf.w - conf.mx * 2))
    //     .attr('y1', zeroPo)
    //     .attr('y2', zeroPo)
    // }
  }

  const detectXPo = (e: MouseEvent, f: (d: number) => void) => {
    const x0 = x.invert(d3.pointer(e)[0])
    const i = d3.bisector((d) => d).left(years, x0)
    const d0 = years[i - 1]
    const d1 = years[i]

    if (d0 && d1) {
      const d = x0 - d0 > d1 - x0 ? d1 : d0
      f(d)
    }
  }

  const overlayFunc = (svg: SvgSelection, func: any) => {
    const focusLine = svg.select('.line')
    const moveFunc = (d: number) =>
      focusLine.attr('transform', `translate(${x(d)}, 0)`)
    const clickFunc = (d: number) => {
      const i = years.findIndex((y) => y === d)
      func(i)
    }
    svg
      .select('.overlay')
      .on('mouseover', () => focusLine.attr('opacity', 1))
      .on('mouseout', () => focusLine.attr('opacity', 0))
      .on('mousemove', (e) => detectXPo(e, moveFunc))
      .on('click', (e) => detectXPo(e, clickFunc))
  }

  const drawDetail = (el: HTMLElement, func: any) => {
    const svg = d3.select(el)
    drawXAxis(svg)
    drawYAxis(svg)
    overlayFunc(svg, func)

    let initStatus = true

    function updateFocus(i: number) {
      const xPo = x(years[i])
      const _r = Object.values(rest).map((m) => y(m[i]))
      const a = y2(rate[i])
      const b = y3(total[i])
      _r.push(a)
      _r.push(b)

      const focus = svg.select('.focus')
      const circles = focus.selectAll('circle')

      if (initStatus) {
        focus.attr('transform', `translate(${xPo}, 0)`)
        circles.each((data, i, nodes) => {
          d3.select(nodes[i]).attr('cy', _r[i])
        })
        initStatus = false
      } else {
        focus.transition().attr('transform', `translate(${xPo}, 0)`)
        circles.each((data, i, nodes) => {
          d3.select(nodes[i]).transition().attr('cy', _r[i])
        })
      }
    }

    return { updateFocus }
  }

  return {
    keys,
    years,
    rest,
    rate,
    total,
    line,
    line2,
    area,
    transposeFunc,
    drawDetail,
  }
}
