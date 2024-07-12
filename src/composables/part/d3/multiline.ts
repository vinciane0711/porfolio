import * as d3 from 'd3'

type SvgSelection = d3.Selection<HTMLElement, unknown, null, undefined>

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

export const initMultiline = (el: HTMLElement, years: string[], keys: string[], values: number[][]) => {
  const periods = years.map((y) => Number(y))
  const conf = {
    w: 400,
    h: 200,
    mt: 10,
    mb: 30,
    mx: 40,
  }

  const svg = d3.select(el).attr('viewBox', `0, 0, ${conf.w}, ${conf.h}`)
  const numRange = d3.extent(values.flat()) as number[]
  const x = d3.scaleLinear(d3.extent(periods) as number[], [conf.mx, conf.w - conf.mx])
  const y = d3.scaleLinear(numRange, [conf.h - conf.mb, conf.mt])
  const line = d3.line(
    (d) => x(d[0]),
    (d) => y(d[1])
  )

  function drawXAxis(svg: SvgSelection) {
    const spacing = periods.length <= 10 ? periods.length : conf.w / 40

    svg
      .append('g')
      .attr('transform', `translate(0,${conf.h - conf.mb})`)
      .call(d3.axisBottom(x).ticks(spacing, ''))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('x2', conf.w - conf.mx * 2)
          .attr('transform', 'translate(-10,5) rotate(-40)')
      )
  }

  function drawYAxis(svg: SvgSelection) {
    svg
      .append('g')
      .attr('transform', `translate(${conf.mx},0)`)
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
  }

  function drawLines(svg: SvgSelection) {
    const transposeFunc = (r: number[]) => d3.transpose([periods, r]) as [number, number][]
    const lineGroup = svg.append('g').attr('stroke-width', '2')
    lineGroup
      .selectAll('path')
      .data(values)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => {
        const countyId = keys[i].slice(0, 8) as unknown as keyof typeof colorList
        return colorList[countyId]
      })
      .attr('d', (d) => line(transposeFunc(d)))
  }
  function updateFocus(i: number) {
    const xPo = x(periods[i])
    const focus = svg.select('.focus')
    focus.transition().attr('transform', `translate(${xPo}, 0)`)
    focus
      .selectAll('circle')
      .data(values)
      .join('circle')
      .transition()
      .attr('cy', (d) => y(d[i]))
  }

  drawXAxis(svg)
  drawYAxis(svg)
  drawLines(svg)

  return { updateFocus }
}
