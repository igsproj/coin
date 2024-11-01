import { renderCustomSelect } from '../../components/CustomSelect/CustomSelect.jsx'
import { runAsFunction } from '../../js/lib.js'

export class CustomSelect {
  items = []
  hideClass = 'none'
  checked = 0

  constructor(domId, onListClick, onCheckItem) {
    this.domId = domId
    this.onListClick = onListClick
    this.onCheckItem = onCheckItem
  }

  addItem(descr, data) {
    this.items.push({ id: this.items.length + 1, descr: descr, data: data })
  }

  cleanItems() {
    this.items = []
  }

  getChecked() {
    return this.items[this.checked]
  }

  trigHideClass() {
    this.hideClass = this.hideClass.length ? '' : 'none'
  }

  onCheck(key) {
    const checked = Number(key) - 1

    if (this.checked !== checked) {
      this.checked = checked
      return true
    }
    return false
  }

  isOpened() {
    return !this.hideClass.length
  }

  onOpenList(rootElem, selectProps, mode) {
    if (mode === undefined) this.trigHideClass()

    if (mode === 'close') this.hideClass = 'none'

    if (mode === 'open') this.hideClass = ''

    rootElem.replaceChildren(renderCustomSelect(selectProps))
  }

  select(emit, lastEmit, props, key, domFindFunc, onCheckCb, onClickOutsideCb, onTrigCb) {
    const elem = runAsFunction(domFindFunc)(`#${this.domId}`)

    if (!elem) return

    if (emit === this.onListClick) {
      this.onOpenList(elem, props)
      runAsFunction(onTrigCb)(elem)
    }

    if (emit === this.onCheckItem && this.onCheck(key)) {
      if (props.closeOnSelect) this.onOpenList(elem, props, 'close')
      runAsFunction(onCheckCb)(elem)
    }

    if (
      emit === 'click' &&
      ![this.onListClick, this.onCheckItem].includes(lastEmit) &&
      this.isOpened()
    ) {
      this.onOpenList(elem, props, 'close')
      runAsFunction(onClickOutsideCb)(elem)
    }
  }
}
