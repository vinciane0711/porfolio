import L from 'leaflet'

interface ICustomControl {
  options: {
    className: string
  }
  _container: HTMLElement
  onAdd(): HTMLElement
  onUpdate(props?: any): void
}

// @ts-ignore
const control: ICustomControl = {
  options: {
    className: 'bg-white p-4 w-40 border border-gray-300 rounded-md',
  },
  onAdd() {
    this._container = L.DomUtil.create('div', this.options.className)
    this.onUpdate()
    return this._container
  },
  onUpdate(props: any) {
    this._container.innerHTML =
      '<h4>區域名稱及代碼</h4>' + (props ? `${props.name}: ${props.nat_ref} ` : 'Hover over a state')
  },
}

export default function customPanel() {
  const LControl = L.Control.extend(control)
  return new LControl()
}
