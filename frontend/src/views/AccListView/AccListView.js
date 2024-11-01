import { renderPagePart, api, sendEmitToWindow } from '../../js/shared.js'
import {
  selectItemClass,
  selectItemsClass,
  selectInputClass,
  eventBeginDelay
} from '../../js/init.js'

import check from '../../assets/images/check.svg'
import arrowDown from '../../assets/images/tri-down.svg'
import arrowUp from '../../assets/images/tri-up.svg'

const { renderAccListView } = await import('./AccListView.jsx')
const { renderAccList } = await import('../../components/AccList/AccList.jsx')

const { AppView } = await import('../../types/AppView.js')
const { CustomSelect } = await import('../../components/CustomSelect/CustomSelect.js')

export class AccListView extends AppView {
  accounts = []
  sortDir = ''

  renderModes = {
    reload: this.accListReload,
    sort: this.accListSort,
    addAccount: this.accListAdd
  }

  constructor(domRootId, appMountId, viewId, params) {
    super(domRootId, appMountId, viewId)
    if (['asc', 'desc'].includes(params.sortDir)) this.sortDir = params.sortDir // если не передать сортировку, то без сортировки

    this.accSortSelect = new CustomSelect('acc-sort-id', 'accSortClick', 'accSortCheckItem')
    this.accSortSelect.addItem('По номеру', 'account')
    this.accSortSelect.addItem('По балансу', 'balance')
    this.accSortSelect.addItem('По последней транзакции', 'date')

    this.selectProps = {
      params: this.accSortSelect,
      dest: this.viewId,
      readOnly: true,
      checkImg: check,
      openImg: arrowDown,
      closeImg: arrowUp,
      openBy: 'input',
      selectPlaceholder: 'Сортировка',
      selectWrap: 'acc-list-sort',
      inputClass: selectInputClass + ' acc-list-input',
      itemClass: selectItemClass,
      itemsClass: selectItemsClass
    }
  }

  getAccValue(elem, field) {
    if (field === 'date')
      return !elem.transactions[0] ? 0 : new Date(elem.transactions[0].date).getTime()

    return Number(elem[field])
  }

  accListSort() {
    const sort = this.accSortSelect.getChecked().data

    if (this.sortDir === 'asc')
      this.accounts.sort((a, b) => this.getAccValue(a, sort) - this.getAccValue(b, sort))

    if (this.sortDir === 'desc')
      this.accounts.sort((a, b) => this.getAccValue(b, sort) - this.getAccValue(a, sort))

    return this.accounts
  }

  async accListReload() {
    return await api('/accounts', { method: 'GET' }, async (httpRes) => {
      this.accounts = httpRes.payload
      return this.accListSort()
    })
  }

  async accListAdd() {
    return await api('/create-account', { method: 'POST' }, async (httpRes) => {
      this.accounts.push(httpRes.payload)
      return this.accListSort()
    })
  }

  async getAccounts(mode) {
    if (!(mode in this.renderModes)) {
      console.log('not found', mode)
      return false
    }

    const func = this.renderModes[mode].bind(this)
    const data = await func()
    if (!data) return false

    this.accounts = data
    return this.accounts
  }

  // рендер только списка счетов
  async renderAccList(mode) {
    if (!(await this.getAccounts(mode))) return false

    return renderAccList({ items: this.accounts, viewId: this.viewId })
  }

  /*****************************************
  API
  *****************************************/

  async getViewDom(mode, srcData) {
    if (!(await this.getAccounts(mode))) return false

    this.newProps = Object.assign({}, srcData)
    this.newProps.accListId = 'acc-list-id'
    this.newProps.accounts = { items: this.accounts, viewId: this.viewId }

    this.accSortSelect.hideClass = 'none'
    this.newProps.select = this.selectProps

    return renderAccListView(this.newProps)
  }

  processEmit(emit, data) {
    this.accSortSelect.select(
      emit,
      this.lastEmit,
      this.selectProps,
      data.key,
      this.getDomElem.bind(this),
      () => {
        renderPagePart(
          async () => this.renderAccList('sort'),
          this.getDomElem(`#${this.newProps.accListId}`)
        )
      }
    )

    if (emit === 'accAddClick') {
      renderPagePart(
        async () => {
          let httpRes = null,
            eventBegin = false

          setTimeout(() => {
            if (httpRes === null) {
              sendEmitToWindow('exec', 'addAccountBegin')
              eventBegin = true
            }
          }, eventBeginDelay)

          httpRes = await this.renderAccList('addAccount')

          if (eventBegin) sendEmitToWindow('exec', 'addAccountEnd')

          return httpRes
        },
        this.getDomElem(`#${this.newProps.accListId}`)
      )
    }
  }
}
