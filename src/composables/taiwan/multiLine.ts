import * as d3 from 'd3'

export const conf = {
  w: 400,
  h: 200,
  mt: 10,
  mb: 30,
  mx: 40,
}

type MatrixArray = [number, number][]

export const initChart = (el: HTMLElement, years: number[], func: any) => {
  const svg = d3.select(el)
  const x = d3.scaleLinear(d3.extent(years) as number[], [
    conf.mx,
    conf.w - conf.mx,
  ])

  const y = d3.scaleLinear().range([conf.h - conf.mb, conf.mt])
  const y2 = d3.scaleLinear().range([conf.h - conf.mb, conf.mt])
  const line = d3.line().x((d) => x(d[0]))
  const line2 = d3.line().x((d) => x(d[0]))
  const area = d3
    .area()
    .curve(d3.curveCardinal.tension(0.95))
    .x((d) => x(d[0]))
    .y0(conf.h - conf.mb)

  const transposeFunc = (r: number[]) => d3.transpose([years, r]) as MatrixArray

  // draw X Axis
  svg
    .select('.x-axis')
    .call(d3.axisBottom(x).ticks(conf.w / 40, ''))
    .call((g) =>
      g
        .selectAll('.tick text')
        .attr('x2', conf.w - conf.mx * 2)
        .attr('transform', 'translate(-10,5) rotate(-40)')
    )

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

  // draw Y Axis
  const updateYAxis = (rest: number[][], rate: number[]) => {
    y.domain(d3.extent(rest.flat()) as number[])
    y2.domain(d3.extent(rate) as number[])
    line.y((d) => y(d[1]))
    line2.y((d) => y2(d[1]))
    area.y1((d) => y(d[1]))

    svg
      .select('.y-axis1')
      .call(d3.axisLeft(y).ticks(conf.h / 40, '~s'))
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('x2', conf.w - conf.mx * 2)
          .attr('stroke-opacity', '0.1')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.join('text').attr('x', -conf.mx).attr('y', 10))

    svg
      .select('.y-axis2')
      .call(d3.axisRight(y2).ticks(conf.h / 40, '~s'))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke-opacity', '0.3'))
      .call((g) => g.join('text').attr('x', -conf.mx).attr('y', 10))

    svg.select('.rate-line').attr('d', line2(transposeFunc(rate)))
    svg
      .selectAll('.rest-line')
      .data(rest)
      .join('path')
      .attr('d', (d) => line(transposeFunc(d)))

    svg
      .selectAll('.rest-bg')
      .data(rest)
      .join('path')
      .attr('d', (d) => area(transposeFunc(d)))
  }

  function updateFocus(year: number, arr: number[]) {
    const xPo = x(year)
    const _r = Object.values(arr).map((m, i) => (i === 2 ? y2(m) : y(m)))
    const focus = svg.select('.focus')
    const circles = focus.selectAll('circle')

    focus.transition().attr('transform', `translate(${xPo}, 0)`)
    circles.each((data, i, nodes) => {
      d3.select(nodes[i]).transition().attr('cy', _r[i])
    })
  }

  return {
    updateYAxis,
    updateFocus,
  }
}
