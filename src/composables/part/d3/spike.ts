import * as d3 from 'd3'
import type { AreaFeatures } from '@/types'

export const initSpike = (svg: d3.Selection<any, any, any, any>, rawData: AreaFeatures) => {
  const townMap = new Map(rawData.features.map((d) => [d.properties.VILLCODE, d]))
  const spikeGroup = svg.append('g').attr('fill-opacity', 0.5).attr('stroke', 'red').attr('stroke-width', 0.5)

  // creates a triangular path of the given length (height) with a base width of 7 pixels
  const spike = (length: number, width = 4) => `M${-width / 2},0L0,${-length}L${width / 2},0`

  function updateSpike(obj: Record<string, number>, geoGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>) {
    const range = [0, 35000]
    const length = d3.scaleLinear(range, [0, 100])
    const colorFunc = d3.scaleLinear(range, ['white', 'orange'])

    const data = Object.entries(obj)
      .map(([k, v]) => {
        const f = townMap.get(k)!
        return {
          center: geoGenerator.centroid(f),
          id: k,
          value: v,
        }
      })
      .sort((a, b) => d3.descending(a.value, b.value))

    spikeGroup
      .selectAll('path')
      .data(data)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('transform', (d) => `translate(${d.center})`)
            .attr('d', (d) => spike(length(d.value)))
            .attr('fill', (d) => colorFunc(d.value)),
        (update) => update.attr('d', (d) => spike(length(d.value))).attr('fill', (d) => colorFunc(d.value))
      )
  }

  return { updateSpike }
}
