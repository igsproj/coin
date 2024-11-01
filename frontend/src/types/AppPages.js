import { sendEmitToWindow, sendEvToNode, renderPagePart } from '../js/shared.js'
import { isEmptyObj, isValidStr, runAsFunction, getObjChild } from '../js/lib.js'
import { eventBeginDelay } from '../js/init.js'

const { AppView } = await import('../types/AppView.js')

export class AppPages {
  appViews = {}
  activeViews = {}
  hideClass = 'none'

  addView(viewName, viewObj, options) {
    if (!(viewName in this.appViews)) {
      this.appViews[viewName] = {}
      this.appViews[viewName].data = viewObj
      this.appViews[viewName].options = options
      this.appViews[viewName].onRenderCb = null
      this.appViews[viewName].beforeShowCb = null
      this.appViews[viewName].sendRenderEvent = false
    }
  }

  registerCb(viewName, onRenderCb, beforeShowCb) {
    if (!(viewName in this.appViews)) {
      console.warn(`AppPages.registerCb: no view with name '${viewName}'`)
      return
    }

    if (typeof onRenderCb === 'function')
      this.appViews[viewName].onRenderCb = onRenderCb

    if (typeof beforeShowCb === 'function')
      this.appViews[viewName].beforeShowCb = beforeShowCb
  }

  getAppViews(viewName) {
    return this.appViews[viewName]
  }

  getView(viewName) {
    if (!isValidStr(viewName)) return null
    return getObjChild(this.appViews, `${viewName}.data`, null)
  }

  getActiveView(domId) {
    return this.activeViews[domId]
  }

  setSendRenderEvent(viewName, flag = true) {
    const obj = this.getAppViews(viewName)
    if (obj && typeof flag === 'boolean')
      obj.sendRenderEvent = flag
  }

  setRenderIt(viewName, flag = true) {
    const obj = this.getView(viewName)
    if (obj && typeof flag === 'boolean')
      obj.renderIt = flag
  }

  async renderView(view, mode, props, onRenderCb, renderEvents) {
    let res = true,
      viewDom = null,
      eventBegin = false

    if (renderEvents)
      setTimeout(() => {
        if (viewDom === null) {
          sendEmitToWindow('exec', 'viewRenderBegin')
          eventBegin = true
        }
      }, eventBeginDelay)

    viewDom = await view.getViewDom(mode, props)
    if (!viewDom) {
      res = false
    } else {
      // добавляем узел в Dom
      if (!view.domRoot) view.initDom()

      if (!(await renderPagePart(viewDom, view.domRoot))) res = false
      else runAsFunction(onRenderCb)()
    }

    if (eventBegin) sendEmitToWindow('exec', 'viewRenderEnd')

    view.renderIt = false
    return res
  }

  // objOrStr : view или viewName
  _getViewBy(objOrStr) {
    let view = null
    if (isValidStr(objOrStr)) {
      view = this.getView(objOrStr)
    } else if (objOrStr instanceof AppView) view = objOrStr

    return view
  }

  _hideHelper(view, func) {
    view = this._getViewBy(view)
    if (view && view.domRoot instanceof Element) view.domRoot.classList[func](this.hideClass) // TODO видимо лучше добавлять inline style - display : none ?
  }

  // view : view или viewName
  hide(view) {
    this._hideHelper(view, 'add')
  }

  // view : view или viewName
  show(view) {
    this._hideHelper(view, 'remove')
  }

  async showView(viewName, mode, props, onRenderCb, beforeShowCb) {
    const view = this.getView(viewName)

    // view не инициализирован в Dom
    if (!view.domRoot) this.setRenderIt(viewName)

    const _onRenderCb = typeof onRenderCb === 'function' ? onRenderCb : this.getAppViews(viewName).onRenderCb // Если не передали onRenderCb, попробуем взять дефолтный
    const _beforeShowCb = typeof beforeShowCb === 'function' ? beforeShowCb : this.getAppViews(viewName).beforeShowCb // аналогично

    if (view.renderIt && !(await this.renderView(view, mode, props, _onRenderCb, this.getAppViews(viewName).sendRenderEvent)))
      return false

    // все view группируются по их точке монтирования : view.appMountId. В пределах точки всегда активен только один view
    if (!(view.appMountId in this.activeViews)) this.activeViews[view.appMountId] = {}

    // скрыть текущий видимый в той же группе
    if (isEmptyObj(this.activeViews[view.appMountId]) === false)
      this.hide(this.activeViews[view.appMountId])

    this.activeViews[view.appMountId] = view

    runAsFunction(_beforeShowCb)()
    this.show(view)

    return true
  }

  // Удаляем views из Dom + информацию по текущей их активности. Сами объекты view не удаляются! Для сброса данных нужно во view написать функцию resetData()
  removeViews() {
    this.activeViews = {}
    for (let viewName in this.appViews) {
      const viewObj = this.getView(viewName)
      viewObj.resetData()

      if (getObjChild(this.appViews[viewName], 'options.noDelete')) continue

      if (viewObj.domRoot) {
        viewObj.domRoot.remove()
        viewObj.domRoot = null
      }
    }
  }

  // отправляем 'click' текущим видимым view, чтобы закрывать select
  static catchClick(pages) {
    window.addEventListener('click', (ev) => {
      for (let view in pages.activeViews) {
        const node = pages.activeViews[view].domRoot
        if (node instanceof Element) {
          sendEvToNode('emit', 'click', {}, node)
        }
      }
    })
  }

  // обработка глобальных emits
  static catchEmits(pages, userCb) {
    window.addEventListener('emit', async (ev) => {
      // значения приходят как строки! Пустое значение для dest будет 'undefined' (строкой !)
      const { emit, data, dest } = AppView.processEvent(ev)

      const destView = pages.getView(dest) // отдаем обработчику компонента
      if (destView && destView.domRoot instanceof Element) {
        sendEvToNode('emit', emit, ev.detail.data, destView.domRoot, false)
        return
      }

      if (emit === 'renderView') pages.setRenderIt(data.view)

      runAsFunction(userCb)(emit, data, pages)
    })
  }
}
