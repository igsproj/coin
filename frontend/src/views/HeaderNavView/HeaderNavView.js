import { runAsFunction } from '../../js/lib.js'
import { sendEmitToWindow } from '../../js/shared.js'

const { AppView } = await import('../../types/AppView.js')
const { renderHeaderNav } = await import('../../components/HeaderNav/HeaderNav.jsx')

export class HeaderNavView extends AppView {
  curItem
  navItems = {}
  emit = 'navBtnClick'
  activeClass = 'header-btn-active'

  /*****************************************
  API
  *****************************************/
  addNavItem(btnId, descr, execCb) {
    if (!(btnId in this.navItems)) this.navItems[btnId] = {}

    this.navItems[btnId].descr = descr
    this.navItems[btnId].exec = execCb
  }

  async onNavClick(btnId) {
    let domEl = this.getDomElem('#' + btnId)
    if (!domEl) {
      console.error(`onNavClick : не найден элемент с id = '${btnId}'`)
      return
    }

    if (domEl === this.curItem) return

    const res = await runAsFunction(this.navItems[btnId].exec)()

    // переключаем tab только если успешно получены данные
    if (res !== false) {
      domEl.classList.add(this.activeClass)
      this.unselect(domEl)
    }
  }

  unselect(setVal) {
    if (this.curItem) this.curItem.classList.remove(this.activeClass)
    this.curItem = setVal
  }

  select(btnId) {
    sendEmitToWindow('exec', this.emit, { id: btnId })
  }

  async getViewDom(mode, srcData) {
    this.newProps = Object.assign({}, srcData)
    this.newProps.emit = this.emit
    this.newProps.items = this.navItems

    return renderHeaderNav(this.newProps)
  }

  processEmit(emit, data) {}
}
