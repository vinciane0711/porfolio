export * from '@/composables/part/convertData'

export const strToNum = (num: string) => parseFloat(num.replace(/,/g, '')) || 0
// x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const numWithCommas = (x: number, wen = false) => {
  if (wen) {
    const n = x / 10000
    if (n < 1) {
      return x.toLocaleString('en-US')
    } else {
      if (n >= 10000) {
        return (n / 10000).toFixed(2) + '億'
      } else if (n >= 1000) {
        return (n / 1000).toFixed(2) + '千萬'
      } else if (n >= 100) {
        return (n / 100).toFixed(2) + '百萬'
      } else {
        return Math.floor(n) + ' 萬'
      }
    }
  }
  return x.toLocaleString('en-US')
}
