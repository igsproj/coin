import { isNumber } from '../js/lib.js'

export class Paginator {
  sliceDirections = ['ltr', 'rtl'] // 'ltr' - left to right, 'rtl' - right to left
  _numRec = 0
  _srcData = []

  constructor(srcData, numRec, dir) {
    this.srcData = srcData
    this.numRec = numRec
    this.setSliced(dir)
  }

  // dir - левая и правая нарезка
  _slice(dir) {
    const res = []
    let cnt = 0

    if (dir === 'ltr')
      for (let i = 0; i < this.srcData.length; ++i) {
        if (i === 0 || cnt > this.numRec - 1) {
          res.push([])
          cnt = 0
        }

        res.at(-1).push(this.srcData[i])
        ++cnt
      }

    if (dir === 'rtl') {
      const end = this.srcData.length - 1
      for (let i = end; i >= 0; --i) {
        if (i === end || cnt > this.numRec - 1) {
          res.unshift([])
          cnt = 0
        }

        res[0].unshift(this.srcData[i])
        ++cnt
      }
    }

    return res
  }

  set srcData(val) {
    if (Array.isArray(val))
      this._srcData = val
  }

  get srcData() {
    return this._srcData
  }

  set numRec(val) {
    if (isNumber(val, true) && val > 0) this._numRec = val
  }

  get numRec() {
    return this._numRec
  }

  // инициализация. можно вызывать для уже созданного объекта. для изменения шага, предварительно установить numRec(val)
  setSliced(dir) {
    this.dir = this.sliceDirections.includes(dir) ? dir : 'ltr'
    this.paginData = this.numRec > 0 ? this._slice(this.dir) : [this.srcData] // при нулевой пагинации отдаем все исходные данные как есть
    this.end = this.paginData.length - 1
    this.curPaginIndex = 0
  }

  first() {
    // console.log('first')
    this.curPaginIndex = 0
    return this.paginData[0]
  }

  last() {
    this.curPaginIndex = this.end
    return this.paginData.at(-1)
  }

  next() {
    if (this.curPaginIndex < this.end) ++this.curPaginIndex

    return this.current()
  }

  prev() {
    if (this.curPaginIndex > 0) --this.curPaginIndex

    return this.current()
  }

  current() {
    return this.paginData[this.curPaginIndex]
  }

  pos(rec) {
    if (!isNumber(rec, true) || rec < 0 || rec > this.end) return

    this.curPaginIndex = rec
    return this.current()
  }

  isBegin() {
    return this.curPaginIndex === 0
  }

  isEnd() {
    return this.curPaginIndex === this.end
  }
}

export class ViewPaginator extends Paginator {
  constructor(srcData, numRec, dir, evSrc, evDest /*, prevPaginBtn, nextPaginBtn*/) {
    super(srcData, numRec, dir)
    this.evSrc = evSrc
    this.evDest = evDest
    // this.prevPaginBtn = typeof prevPaginBtn === 'string' ? prevPaginBtn : ''
    // this.nextPaginBtn = typeof nextPaginBtn === 'string' ? nextPaginBtn : ''
  }

  // объект с готовыми пропсами под компонент Paginator.jsx
  getProps() {
    return {
      dest: this.evDest,
      src: this.evSrc,
      pagination: this.numRec > 0 && this.srcData.length > this.numRec ? '' : 'none', // класс который скрывает кнопки пагинации, если в них нет смысла
      prevPaginBtnDisabled: this.isBegin(), // авто блокировка кнопки назад
      // prevPaginBtn: this.prevPaginBtn, // установка доп класса для кнопки назад
      nextPaginBtnDisabled: this.isEnd() // авто блокировка кнопки вперед
      // nextPaginBtn: this.nextPaginBtn // установка доп класса для кнопки вперед
    }
  }

  prepare(func, setPos) {
    const srcData = this[func](setPos)
    return { data: srcData ? srcData : [], props: this.getProps() }
  }
}

/***********************************
Первый вариант, оставим для истории
***********************************/

class Paginator_OLD {
  // startFrom : 'start', 'end' . default 'start'
  constructor(srcData, numRec, startFrom) {
    this.startFrom = startFrom
    this.srcData = srcData
    this.numRec = numRec

    this.end = this.srcData.length
    this.start = 0

    // default - pagination from start
    this.curPaginIndex = this.start

    if (this.startFrom === 'end') {
      this.curPaginIndex = this.end //this.srcData.length - 1
    }
  }

  getPaginPosAsStr() {
    if (this.curPaginIndex === this.start + this.numRec) return 'start' // начальная позиция после первого next() / prev()

    if (this.curPaginIndex === this.end) return 'end'

    return 'mid'
  }

  // from end to start
  prev() {
    const index = Math.max(this.start, this.curPaginIndex - this.numRec)
    const res = this.srcData.slice(index, this.curPaginIndex)

    this.curPaginIndex = index > this.start ? (this.curPaginIndex -= this.numRec) : this.start

    return res
  }

  // from start to end
  next() {
    const index = Math.min(this.end, this.curPaginIndex + this.numRec)
    const res = this.srcData.slice(this.curPaginIndex, index)

    this.curPaginIndex = index !== this.end ? (this.curPaginIndex += this.numRec) : this.end

    return res
  }
}
