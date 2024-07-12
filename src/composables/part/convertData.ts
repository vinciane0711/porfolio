import * as topojson from 'topojson'
import type { AreaFeature } from '@/types'
import type { GeometryCollection, GeometryObject, FeatureCollection } from 'geojson'
import type { IArea } from '@/types'

export const topoFunc = {
  // convert topojson to geojson
  convert: <T = IArea>(data: any, obj: any) =>
    topojson.feature(data, obj) as unknown as FeatureCollection<GeometryObject, T>,
  merge: (data: any, obj: any) => topojson.merge(data, obj),
  mesh: (data: any, obj: any) => topojson.mesh(data, obj),
}

export async function getMapChunk(arr: { code: string; towns: string[] }[]) {
  let main: AreaFeature[] = []
  let sub: GeometryCollection = { type: 'GeometryCollection', geometries: [] }

  const f = async (code: string, cntTownStr: string[]) =>
    await import(`../../assets/data/map/chunk/${code}.json`).then((o) => {
      const n = 5 / 10000000
      const ps = topojson.presimplify(o)
      const res = topojson.simplify(ps, n)
      const obj = res.objects[`COUNTYCODE_${code}`]

      const _d = topoFunc.convert(res, obj)
      const m = _d.features.filter((f) => cntTownStr.includes(f.properties.TOWNNAME))
      const s = cntTownStr.map((t) => {
        return topojson.merge(
          res,
          obj.geometries.filter((a: any) => a.properties.TOWNNAME === t)
        )
      })

      main = [...main, ...m]
      sub.geometries = [...sub.geometries, ...s]
    })

  const promises = arr.map((a) => f(a.code, a.towns))
  return await Promise.all(promises).then(() => {
    return { main, sub }
  })
}

//  {name:string, children:[{name:string, value:number}]}
const makeHierarchyData = (data: Record<string, number>, func: (...arg: any) => string) => {
  const ddd: any = {}
  Object.entries(data).forEach(([id, _v]) => {
    const city = id.slice(0, 5)
    const county = id.slice(0, 8)

    const _o = {
      name: func(false, id),
      value: _v,
    }

    if (ddd[city]) {
      if (ddd[city][county]) {
        ddd[city][county].push(_o)
      } else {
        ddd[city][county] = [_o]
      }
    } else {
      ddd[city] = { [county]: [_o] }
    }
  })

  const g = { name: '人口數', children: [] as any[] }
  for (const city in ddd) {
    const cityName = func(false, city)
    const arr: any = []
    for (const county in ddd[city]) {
      const n = func(false, county)
      const countyName = n!.slice(cityName!.length)

      const cc = ddd[city][county].map((t: any) => {
        t.name = t.name.slice(n!.length)
        return t
      })
      arr.push({
        name: countyName,
        children: cc,
      })
    }
    g.children.push({ name: cityName, children: arr })
  }

  return g
}
// import tempData from '@/composables/north/temp.json'
// initChart(el.value, makeHierarchyData(tempData))
// initPack(el.value, makeHierarchyData(tempData))
