import * as d3 from 'd3'

const width = 800
const height = width
const margin = 10 // to avoid clipping the root circle stroke

// Specify the number format for values.
const format = d3.format(',d')

export const initPack = (el: HTMLElement, data: any) => {
  // Create the pack layout.
  const pack = d3
    .pack()
    .size([width - margin * 2, height - margin * 2])
    .padding(3)

  // Compute the hierarchy from the JSON data; recursively sum the
  // values for each node; sort the tree by descending value; lastly
  // apply the pack layout.
  const root = pack(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value! - a.value!)
  )

  // Create the SVG container.
  const svg = d3.select(el).attr('viewBox', [-margin, -margin, width, height]).attr('text-anchor', 'middle')

  // Place each node according to the layout’s x and y values.
  const node = svg
    .append('g')
    .selectAll()
    .data(root.descendants())
    .join('g')
    .attr('transform', (d) => `translate(${d.x},${d.y})`)

  // Add a title.
  node.append('title').text(
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data?.name)
        .reverse()
        .join('/')}\n${format(d.value!)}`
  )

  const colorFunc = d3.scaleLinear([500, 20000], ['white', 'orange'])

  // Add a filled or stroked circle.
  node
    .append('circle')
    .attr('fill', (d) => (d.children ? '#fff' : colorFunc(d.value!)))
    .attr('stroke', (d) => (d.children ? '#bbb' : null))
    .attr('r', (d) => d.r)

  // Add a label to leaf nodes.
  //   const text = node
  //     .filter((d) => !d.children && d.r > 10)
  //     .append('text')
  //     .attr('clip-path', (d) => `circle(${d.r})`)

  //   // Add a tspan for each CamelCase-separated word.
  //   text
  //     .selectAll()
  //     .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
  //     .join('tspan')
  //     .attr('x', 0)
  //     .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
  //     .text((d) => d)

  //   // Add a tspan for the node’s value.
  //   text
  //     .append('tspan')
  //     .attr('x', 0)
  //     .attr('y', (d) => `${d.data.name.split(/(?=[A-Z][a-z])|\s+/g).length / 2 + 0.35}em`)
  //     .attr('fill-opacity', 0.7)
  //     .text((d) => format(d.value))
}
