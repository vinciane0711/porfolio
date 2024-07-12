import type { Feature, Geometry, GeometryObject, FeatureCollection } from 'geojson'

export interface IArea {
  COUNTYNAME: string // "臺東縣"
  COUNTYID: string // "V"
  COUNTYCODE: string // "10014"
  TOWNNAME: string // "成功鎮"
  TOWNID: string // "V02"
  TOWNCODE: string // "10014020"
  VILLNAME: string // '烏日里',
  VILLCODE: string // '66000230001',
  VILLENG: string // 'Wuri Vil.',
  NOTE: string | null
}

export type AreaFeatures = FeatureCollection<GeometryObject, IArea>
export type AreaFeature = Feature<Geometry, IArea>
export type FeatureType<T> = Feature<Geometry, T>
