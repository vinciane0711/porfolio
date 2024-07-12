import * as d3 from 'd3'
import { strToNum } from '@/composables'

export const conf = {
  w: 400,
  h: 200,
  mt: 10,
  mb: 30,
  mx: 40,
}

const generatePalette = (length: number, boo = false) => {
  if (boo) return ['var(--mainColor)', 'var(--subColor)', 'lightGray']
  return Array.from({ length }, () => 'hsl(' + Math.random() * 360 + ', 80%, 50%)')
}

export const formatter = (n: number) => {
  const f = d3.format('.3s')
  return f(n)
}

type SvgSelection = d3.Selection<HTMLElement, unknown, null, undefined>

export const initChart = (years: string[], body: string[][], average?: number[]) => {
  const periods = years.map((y) => Number(y))
  // const average = dataSum?.map((s) => Math.round(s / body.length))

  const { keys, values } = body.reduce(
    (acc, cnt) => {
      const [key, ...vals] = cnt
      acc.keys.push(key)
      acc.values.push(vals.map((v) => strToNum(v)))
      return acc
    },
    { keys: [], values: [] } as { keys: string[]; values: number[][] }
  )

  const palette = generatePalette(keys.length)
  const numRange = d3.extent(values.flat()) as number[]
  const x = d3.scaleLinear(d3.extent(periods) as number[], [conf.mx, conf.w - conf.mx])
  const y = d3.scaleLinear(numRange, [conf.h - conf.mb, conf.mt])

  const line = d3.line(
    (d) => x(d[0]),
    (d) => y(d[1])
  )

  // const ttt = () => {
  //   const thirdData = twoDataHandler(body, relation)
  //   if (!thirdData) return
  //   const rates = Object.values(thirdData)
  //   const y = d3.scaleLinear(d3.extent(rates) as number[], [conf.h - conf.mb, conf.mt])
  //   const line = d3.line(
  //     (d) => x(d[0]),
  //     (d) => y(d[1])
  //   )
  //   return { rates, y, line }
  // }
  // const _t = ttt()

  let vvv: number[][] = []
  // if (_t) {
  //   vvv = [...values, _t.rates]
  // } else
  if (average) {
    vvv = [...values, average]
  } else {
    vvv = values
  }

  const transposeFunc = (r: number[]) => d3.transpose([periods, r])

  const detectXPo = (e: MouseEvent, f: (d: number) => void) => {
    const x0 = x.invert(d3.pointer(e)[0])
    const i = d3.bisector((d) => d).center(periods, x0)

    f(i)
  }

  const drawXAxis = (svg: SvgSelection) => {
    const spacing = periods.length <= 10 ? periods.length : conf.w / 40

    svg
      .select('.x-axis')
      .call(d3.axisBottom(x).ticks(spacing, ''))
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

    // if (_t) {
    //   svg
    //     .select('.y-axis2')
    //     .call(d3.axisRight(_t.y).ticks(conf.h / 40, '~s'))
    //     .call((g) => g.select('.domain').remove())
    //     .call((g) => g.selectAll('.tick line').attr('stroke-opacity', '0.3'))
    //     .call((g) => g.append('text').attr('x', -conf.mx).attr('y', 10))
    // }

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
    // }
  }

  const overlayFunc = (svg: SvgSelection, func: any) => {
    const focusLine = svg.select('.line')
    svg
      .select('.overlay')
      .on('mouseover', () => focusLine.attr('opacity', 1))
      .on('mouseout', () => focusLine.attr('opacity', 0))
      .on('mousemove', mousemove)
      .on('click', clickEvent)

    function mousemove(e: MouseEvent) {
      const f = (d: number) => focusLine.attr('transform', `translate(${x(periods[d])}, 0)`)
      detectXPo(e, f)
    }
    function clickEvent(e: MouseEvent) {
      detectXPo(e, func)
    }
  }

  const drawDetail = (el: HTMLElement, func: any) => {
    const svg = d3.select(el)
    drawXAxis(svg)
    drawYAxis(svg)
    overlayFunc(svg, func)

    const lineGroup = svg.select('.multi-lines')
    lineGroup
      .selectAll('path')
      .data(values)
      .join('path')
      .attr('d', (d) => line(transposeFunc(d)))

    if (average) {
      lineGroup
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'lightGray')
        .attr('stroke-dasharray', '4 3')
        .attr('d', () => {
          return line(transposeFunc(average))
          // if (_t) {
          //   return _t.line(transposeFunc(_t.rates))
          // } else {
          //   return line(transposeFunc(average))
          // }
        })
    }

    function updateFocus(i: number) {
      const xPo = x(periods[i])
      const focus = svg.select('.focus')
      focus.transition().attr('transform', `translate(${xPo}, 0)`)
      focus
        .selectAll('circle')
        .data(vvv)
        .join('circle')
        .transition()
        .attr('cy', (d) => y(d[i]))
      // .attr('cy', (d, j) => (_t && j >= body.length ? _t.y(d[i]) : y(d[i])))
    }

    return { updateFocus }
  }

  return {
    drawDetail,
    palette,
    values: vvv,
  }
}
