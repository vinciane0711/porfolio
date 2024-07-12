import * as d3 from 'd3'

const radius = 320
const width = 800
const partition = (data: any) =>
  d3.partition().size([2 * Math.PI, radius * radius])(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value! - a.value!)
  )

const color = d3
  .scaleOrdinal()
  .domain(['home', 'product', 'search', 'account', 'other', 'end'])
  .range(['#5d85cf', '#7c6561', '#da7847', '#6fb971', '#9e70cf', '#bbbbbb'])

const arc = d3
  .arc()
  .startAngle((d) => d.x0)
  .endAngle((d) => d.x1)
  .padAngle(1 / radius)
  .padRadius(radius)
  .innerRadius((d) => Math.sqrt(d.y0))
  .outerRadius((d) => Math.sqrt(d.y1) - 1)

const mousearc = d3
  .arc()
  .startAngle((d) => d.x0)
  .endAngle((d) => d.x1)
  .innerRadius((d) => Math.sqrt(d.y0))
  .outerRadius(radius)

export const initChart = (el: HTMLElement, data: any) => {
  const root = partition(data)
  const svg = d3.select(el)
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node()
  element!.value = { sequence: [], percentage: 0.0, value: 0 }

  const label = svg.append('text').attr('text-anchor', 'middle').attr('fill', '#888').style('visibility', 'hidden')

  label
    .append('tspan')
    .attr('class', 'percentage')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '-0.1em')
    .attr('font-size', '3em')
    .text('')

  label
    .append('tspan')
    .attr('class', 'value')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '1.5em')
    .attr('font-size', '1em')
    .text('')

  label.append('tspan').attr('x', 0).attr('y', 0).attr('dy', '2.5em').text('比率')

  svg.attr('viewBox', `${-radius} ${-radius} ${width} ${width}`).style('font', '12px sans-serif')

  const path = svg
    .append('g')
    .selectAll('path')
    .data(
      root.descendants().filter((d) => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001
      })
    )
    .join('path')
    .attr('fill', (d) => color(d.data!.name) as string)
    .attr('d', arc)

  svg
    .append('g')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseleave', () => {
      path.attr('fill-opacity', 1)
      label.style('visibility', 'hidden')
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0, value: 0 }
      element.dispatchEvent(new CustomEvent('input'))
    })
    .selectAll('path')
    .data(
      root.descendants().filter((d) => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001
      })
    )
    .join('path')
    .attr('d', mousearc)
    .on('mouseenter', (event, d) => {
      // Get the ancestors of the current segment, minus the root
      const sequence = d.ancestors().reverse().slice(1)
      // Highlight the ancestors
      path.attr('fill-opacity', (node) => (sequence.indexOf(node) >= 0 ? 1.0 : 0.3))
      const percentage = ((100 * d.value!) / root.value!).toPrecision(3)
      //   label
      //     .style('visibility', null)
      //     .select('.percentage')
      //     .text(percentage + '%')

      label.style('visibility', null).select('.percentage').text(d.value)
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage, value: d.value }
      element.dispatchEvent(new CustomEvent('input'))
    })
}
