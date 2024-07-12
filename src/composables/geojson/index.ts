import L from 'leaflet'
// https://hihayk.github.io/scale/#6/6/73/88/0/0/-100/100/D688AC/217/136/172/white
const token = import.meta.env.VITE_MAPBOX_TOKEN
const styleId = true ? 'light-v11' : 'qiqily/ckvwo0sz52e1514pcvqyw3t08'
export const tileSource = [
  'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
  'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
  'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=zh',
  'https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png',
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://wmts.nlsc.gov.tw/wmts/EMAP5_OPENDATA/default/GoogleMapsCompatible/{z}/{y}/{x}',
  `https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/{z}/{x}/{y}?access_token=${token}`,
]

const colorRed = [
  '#441A2E',
  '#612942',
  '#7B3957',
  '#944A6C',
  '#AC5D81',
  '#C27297',
  '#D688AC',
  '#D79FB9',
  '#D9B4C5',
  '#DDC7D1',
  '#E3D9DE',
  '#EBE8EA',
  '#F5F5F5',
]
const colorGreen = [
  '#182158',
  '#1F3B6D',
  '#265A81',
  '#2E7F95',
  '#37A8A8',
  '#50B5A2',
  '#6AC2A1',
  '#84CEA5',
  '#9EDAAD',
  '#B9E5BC',
  '#D8F0D5',
]
const distLevel = [0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1, 0.07, 0.05, 0.03]
const villageLevel = [0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.07, 0.05, 0.03]

const colorFunc = (level: number[], color: string[]) => {
  return (num: number) => {
    // console.log(d.toFixed(2))
    return num > level[0]
      ? color[0]
      : num > level[1]
      ? color[1]
      : num > level[2]
      ? color[2]
      : num > level[3]
      ? color[3]
      : num > level[4]
      ? color[4]
      : num > level[5]
      ? color[5]
      : num > level[6]
      ? color[6]
      : num > level[7]
      ? color[7]
      : num > level[8]
      ? color[8]
      : num > level[9]
      ? color[9]
      : color[10]
  }
}

export const updateLayerColor = (pop: Record<string, number>, layer: L.GeoJSON, type: 'dist' | 'village') => {
  layer.setStyle((f) => {
    const id = f?.properties.nat_ref as keyof typeof pop
    const _p = pop[id] as number
    const _d = (_p / pop.total) * 100

    const func = type === 'village' ? colorFunc(villageLevel, colorGreen) : colorFunc(villageLevel, colorRed)

    return {
      fill: true,
      fillColor: func(_d),
      fillOpacity: 0.8,
    }
  })
}

export const createPane = (map: L.Map, name: string, zIndex: number) => {
  const pane = map.createPane(name)
  pane.style.zIndex = zIndex.toString()
  pane.style.pointerEvents = 'none'
}

const boundaryStyle: Record<string, L.PathOptions> = {
  city: {
    fill: false,
    color: 'gray',
    weight: 3,
    opacity: 1,
  },
  district: {
    fill: false,
    color: 'white',
    weight: 2,
    opacity: 1,
    // className: 'hover:fill-red-200',
    // fillOpacity: 0.5,
    // fillColor: 'transparent',
  },
  village: {
    fill: false,
    color: 'white',
    weight: 1,
    opacity: 0.6,
  },
  pop: {
    color: 'transparent',
  },
}

export const drawBoundary = (data: any[], level: keyof typeof boundaryStyle, onEachFunc?: any) => {
  return L.geoJSON(data, {
    style: boundaryStyle[level],
    pane: level,
    onEachFeature: onEachFunc,
  })
}

export const metroLayer = (source: { data: any; color: string }) => {
  const style = { color: source.color, weight: 4, opacity: 1 }
  const markerStyle: L.CircleMarkerOptions = {
    color: source.color,
    radius: 8,
    fillColor: 'white',
    fillOpacity: 1,
    opacity: 1,
  }

  return L.geoJSON(source.data, {
    style,
    pointToLayer: (feature, latLng) => L.circleMarker(latLng, markerStyle),
  })
}
