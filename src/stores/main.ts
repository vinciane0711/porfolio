import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import * as d3 from 'd3'

const MapLevelObj = {
  county: '全台縣市',
  countyDetail: '全台縣市（含區域）',
  town: '單一縣市',
  village: '單一縣市（含村里）',
}

type MapLevel = 'county' | 'countyDetail' | 'town' | 'village'

const counties = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '屏東縣',
  // '連江縣',
  // '金門縣',
  // '澎湖縣',
]

export const useStore = defineStore('main', () => {
  const countyMap = new Map<string, Record<string, string>>()
  const adminMap = new Map<string, string>()
  const codeToStrMap = new Map<string, string>()

  const selectLevel = ref<MapLevel>('county')
  const cntCounty = ref<string>(counties[0])
  const cntTown = ref<string[]>([])
  const townsList = computed(() => {
    const l = countyMap.get(cntCounty.value)
    return l ? Object.values(l) : []
  })

  const cntRows = ref<string[]>([])
  const parseRows = ref<string[]>([])
  const columns = ref<string[]>([])
  const range = ref<number[]>([])
  const rangeControl = reactive({
    min: 0,
    max: 10000,
    dynamic: true,
  })

  const adminFilter = computed(() => {
    let str: string | undefined
    if (selectLevel.value === 'town') {
      str = adminMap.get(cntCounty.value)
    } else if (selectLevel.value === 'village') {
      str = cntTown.value.map((t) => adminMap.get(cntCounty.value + t)).join('|')
    }
    return (k: string) => (str ? RegExp(str).test(k) : true)
  })

  for (const i of counties) {
    countyMap.set(i, {})
  }

  async function initAdminMap() {
    await d3.csv('data/admin_code.csv').then((res) => {
      res.forEach((p) => {
        const { county_id, town_id, village_id, county_name, town_name, village_name } = p
        adminMap.set(county_name, county_id)
        adminMap.set(county_name + town_name, town_id)
        adminMap.set(county_name + town_name + village_name, village_id)

        const _c = countyMap.get(county_name)
        if (_c) _c[town_id] = town_name
      })

      adminMap.forEach((name, id) => {
        codeToStrMap.set(name, id)
      })
    })
  }

  function getPlaceName(needParsed: boolean, key: string) {
    return needParsed ? adminMap.get(key) : codeToStrMap.get(key)
  }

  return {
    adminMap,
    MapLevelObj,
    adminFilter,
    counties,
    countyMap,
    selectLevel,
    cntCounty,
    cntTown,
    cntRows,
    columns,
    parseRows,
    range,
    townsList,
    rangeControl,
    initAdminMap,
    getPlaceName,
  }
})
