import { domCachedStor, isEmptyObj } from '../js/lib.js'

export class AppView {
  _renderIt = false //true
  lastEmit = ''

  constructor(domRootId, appMountId, viewId) {
    this.viewId = viewId
    this.appMountId = appMountId // id родительской группы
    this.domRootId = domRootId // id элемента
    this.newProps = {}
  }

  initDom() {
    this.getDomElem = domCachedStor()

    const app = this.getDomElem('#' + this.appMountId)
    this.domRoot = this.createElem(this.domRootId, 'div', app)

    this.domRoot.classList.add('none') // по умолчанию скрываем view

    if (this.domRoot) this.domRoot.addEventListener('emit', async (ev) => this.viewActions(ev)) // {capture: true}

    // сбрасываем domCache если удаляли nodes
    new MutationObserver((ev) => {
      if (ev[0].removedNodes.length) this.resetDomCache()
    }).observe(this.domRoot, { childList: true })
  }

  set renderIt(val) {
    if (typeof val === 'boolean') this._renderIt = val
  }

  get renderIt() {
    return this._renderIt
  }

  createElem(id, type, domRoot) {
    // элемент создается только если его нет. иначе возвращается готовый
    return this.getDomElem(id, (stor) => {
      const newElem = document.createElement(type)
      newElem.setAttribute('id', id)
      domRoot.append(newElem)

      stor[id] = newElem
      return stor[id]
    })
  }

  static processEvent(ev) {
    if (isEmptyObj(ev.detail) !== false) return { emit: '', data: '{}', dest: '' }

    const emit = ev.detail.emit

    let data = {}
    if (ev.detail.data !== 'undefined') data = JSON.parse(ev.detail.data)

    return { emit: emit, data: data, dest: ev.detail.dest }
  }

  async viewActions(ev) {
    const { emit, data } = AppView.processEvent(ev)

    this.processEmit(emit, data, ev)

    this.lastEmit = emit
  }

  resetDomCache() {
    // console.log(`resetDomCache : ${this.viewId}`)
    this.getDomElem = domCachedStor()
  }

  /*****************************************
  Пользовательские функции
  *****************************************/

  async getViewDom(mode, data) {}

  processEmit(emit, data) {}

  // может использоваться для авто сброса данных в объекте, когда удаляется view
  resetData() {
    //console.log(`resetData: ${this.viewId}`)
  }
}
