import data from './src/assets/data/map/chunk/68000.json' assert { type: 'json' }
import fs from 'fs'

// generate new file by adding NOTE value, nodejs
const l = {
  68000120024: '68000120021',
  68000010077: '68000010004',
  68000010078: '68000010046',
  68000010079: '68000010005',
  68000030028: '68000030017',
  68000050039: '68000050029',
  68000050040: '68000050016',
  68000070031: '68000070010',
  68000070032: '68000070001',
  68000090032: '68000090027',
  68000010080: '68000010022',
  68000010081: '68000010006',
  68000010082: '68000010058',
  68000020086: '68000020022',
  68000020087: '68000020033',
  68000020088: '68000020036',
  68000080049: '68000080002',
  68000080050: '68000080002',
  68000080051: '68000080001',
  68000090033: '68000090016',
}

const geometries = data.objects['COUNTYCODE_68000'].geometries.map((d) => {
  let { VILLCODE } = d.properties
  if (l[VILLCODE]) {
    d.properties.NOTE = l[VILLCODE]
  }

  return d
})

const _n = Object.assign(data)
_n.objects['COUNTYCODE_68000'].geometries = geometries

fs.writeFileSync('./new.json', JSON.stringify(_n))
