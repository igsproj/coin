import { runAsFunction } from '../js/lib'

export class Adaptive {
  breakPoints = []
  isSorted = false

  default = {
    cb: () => console.warn('Adaptive.add: no default callback set'),
    data: null
  }

  constructor(cb, data) {
    if (typeof cb === 'function') {
      this.default.cb = cb
      this.default.data = data
    }
  }

  add(width, cb, data) {
    if (!this.get(width)) {
      this.breakPoints.push({ width: width, cb: cb, data: data })
      this.isSorted = false
    } else console.warn(`Adaptive.add: already has width = ${width}`)
  }

  get(width) {
    return this.breakPoints.find((elem) => elem.width === width)
  }

  useAdaptive(cbParam) {
    if (!this.isSorted) {
      this.breakPoints.sort((a, b) => a.width - b.width)
      this.isSorted = true
    }

    if (window.innerWidth < this.breakPoints[0].width)
      return runAsFunction(this.default.cb)(this.default.data, cbParam)

    for (let i = this.breakPoints.length - 1; i >= 0; --i) {
      if (window.innerWidth >= this.breakPoints[i].width)
        return runAsFunction(this.breakPoints[i].cb)(this.breakPoints[i].data, cbParam)
    }

    return false
  }
}
