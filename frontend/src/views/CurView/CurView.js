import { UnIntlNumber, api, sendEmitToWindow, showNumber, renderPagePart } from '../../js/shared.js'
import {
  realTimeRatesDelay,
  realTimeRatesMaxRec,
  userCurPaginationRec,
  selectItemClass,
  selectItemsClass,
  selectInputClass
} from '../../js/init.js'

import arrowDown from '../../assets/images/tri-down.svg'
import arrowUp from '../../assets/images/tri-up.svg'

const { AppView } = await import('../../types/AppView.js')
const { CustomSelect } = await import('../../components/CustomSelect/CustomSelect.js')
const { ViewPaginator } = await import('../../types/Paginator.js')
const { MaskInput } = await import('maska')

const { renderCurView } = await import('./CurView.jsx')
const { renderCurAmount } = await import('../../components/CurAmount/CurAmount.jsx')
const { renderCurRatesRealTime } = await import(
  '../../components/CurRatesRealTime/CurRatesRealTime.jsx'
)

export class CurView extends AppView {
  userCur = {}
  allCur = []
  ws = null

  constructor(domRootId, appMountId, viewId, params) {
    super(domRootId, appMountId, viewId)

    this.curFromSelect = new CustomSelect(
      'cur-from-select-id',
      'curFromSelectClick',
      'curFromCheckItem'
    )

    this.curToSelect = new CustomSelect('cur-to-select-id', 'curToSelectClick', 'curToCheckItem')

    const selectTmpl = {
      dest: this.viewId,
      readOnly: true,
      openBy: 'input',
      openImg: arrowDown,
      closeImg: arrowUp,
      selectPlaceholder: 'Валюты',
      selectWrap: 'cur-exchange-select',
      inputClass: selectInputClass + ' cur-list-input',
      itemClass: selectItemClass,
      itemsClass: selectItemsClass
    }

    this.selectPropsFrom = Object.assign({ params: this.curFromSelect }, selectTmpl)
    this.selectPropsTo = Object.assign({ params: this.curToSelect }, selectTmpl)
  }

  async getAllCur() {
    return await api('/all-currencies', { method: 'GET' }, async (httpRes) => {
      this.allCur = httpRes.payload

      for (let i = 0; i < this.allCur.length; ++i) {
        const cur = this.allCur[i]
        this.curFromSelect.addItem(cur, cur)
        this.curToSelect.addItem(cur, cur)
      }

      return this.allCur
    })
  }

  async getUserCur() {
    return await api('/currencies', { method: 'GET' }, async (httpRes) => {
      this.userCur = httpRes.payload
      return this.userCur
    })
  }

  async exchange(from, to, amount) {
    const body = {
      from: from,
      to: to,
      amount: amount
    }

    return await api(
      '/currency-buy',
      {
        body: JSON.stringify(body),
        method: 'POST'
      },
      async (httpRes) => {
        this.userCur = httpRes.payload
        return this.userCur
      }
    )
  }

  closeWebSocket() {
    if (this.ws) this.ws.close()
  }

  async rateChangeShow() {
    const rates = {} // вся история курсов
    const display = [] // очередь fifo для показа курсов
    const domWrap = this.getDomElem('#cur-rates-real-time-id')
    let refreshTimer = null

    this.ws = new WebSocket(sessionStorage.getItem('apiWebSocket') + '/currency-feed')

    let started = false
    let wsMessage = ''
    let wsMessageLevel = ''

    function displayRates() {
      // console.log('display buffer =', display.length)

      renderPagePart(() => {
        let data = display.pop() // идем по fifo

        if (!data) data = { rates: [] }

        return renderCurRatesRealTime(data)
      }, domWrap)
    }

    this.ws.onopen = (ev) => {
      sendEmitToWindow('exec', 'message', {
        msg: `WebSocket : обновляю курсы с интервалом в ${realTimeRatesDelay}ms`,
        level: 'message-info'
      })
      // обновляем со своей задержкой realTimeRatesDelay
      refreshTimer = setInterval(() => displayRates(), realTimeRatesDelay)
    }

    this.ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data)
      const key = `${data.from}/${data.to}`

      if (!(key in rates)) rates[key] = { history: [] } // собираем всю историю изменения курса по каждой паре

      if (rates[key].history.length === realTimeRatesMaxRec)
        // ограничение на длину хранимых данных
        rates[key].history.pop() // убираем самые старые данные

      // последнее изменение курса должно быть сверху
      rates[key].history.unshift({
        rate: data.rate,
        change: data.change
      })

      display.unshift({ pair: key, rates: rates[key].history }) // по каждой валютной паре делаем историю в формате fifo для показа с задержкой

      // показать первый раз сразу без задержки
      if (!started) {
        displayRates()
        started = true
      }
    }

    this.ws.onclose = (ev) => {
      if (ev.wasClean) {
        wsMessage = 'WebSocket : cоединение закрыто'
        wsMessageLevel = 'message-info'
      } else {
        wsMessage = 'WebSocket : cоединение прервано'
        wsMessageLevel = 'message-error-critical'

        if (sessionStorage.getItem('token')) {
          // переподключаемся только если залогинены
          sendEmitToWindow('exec', 'message', {
            msg: `WebSocket : попытка подключения через ${realTimeRatesDelay}ms`,
            level: 'message-info'
          })
          setTimeout(() => this.rateChangeShow(), realTimeRatesDelay)
        }
      }

      clearInterval(refreshTimer)
      sendEmitToWindow('exec', 'message', { msg: wsMessage, level: wsMessageLevel })
    }

    this.ws.onerror = (ev) => {
      sendEmitToWindow('exec', 'message', {
        msg: 'WebSocket : ошибка подключения!',
        level: 'message-error-critical'
      })
    }
  }

  prepareUserCurPaginator(fname, setPos) {
    const prepRes = this.userCurPaginator.prepare(fname, setPos)

    this.newProps.userCur = prepRes.data
    this.newProps.userCurPaginator = prepRes.props
  }

  createUserCurPaginator(setPos) {
    this.userCurPaginator = new ViewPaginator(
      Object.keys(this.userCur).map((elem) => this.userCur[elem]),
      userCurPaginationRec,
      'ltr',
      'userCurPaginator',
      this.viewId
    )

    let fname = setPos ? 'pos' : 'first'
    this.prepareUserCurPaginator(fname, setPos)
  }

  // func = 'prev' , 'next'
  renderUserCurPagination(func) {
    renderPagePart(async () => {
      this.prepareUserCurPaginator(func)

      return renderCurAmount(this.newProps)
    }, this.getDomElem('#user-cur-list-id'))
  }

  /*****************************************
  API
  *****************************************/

  createMasks() {
    new MaskInput('#cur-exchange-amount-id', {
      number: {
        locale: 'ru',
        fraction: 20,
        unsigned: true
      }
    })
  }

  async getViewDom(mode, srcData) {
    const httpRespArr = await Promise.all([this.getAllCur(), this.getUserCur()])
    for (let resp of httpRespArr) if (resp === false) return false

    this.newProps = Object.assign({}, srcData)
    this.newProps.dest = this.viewId
    this.newProps.selectPropsFrom = this.selectPropsFrom
    this.newProps.selectPropsTo = this.selectPropsTo

    this.createUserCurPaginator()

    return renderCurView(this.newProps)
  }

  processEmit(emit, data) {
    this.curFromSelect.select(
      emit,
      this.lastEmit,
      this.selectPropsFrom,
      data.key,
      this.getDomElem.bind(this)
    )

    this.curToSelect.select(
      emit,
      this.lastEmit,
      this.selectPropsTo,
      data.key,
      this.getDomElem.bind(this)
    )

    if (data.src === 'userCurPaginator') {
      // пагинаторов может быть несколько в одном view, поэтому нужно дополнительное поле data.src
      if (emit === 'paginNext') this.renderUserCurPagination('next')
      if (emit === 'paginPrev') this.renderUserCurPagination('prev')
    }

    if (emit === 'curExchange') {
      const from = this.curFromSelect.getChecked().descr
      const to = this.curToSelect.getChecked().descr

      if (from === to) {
        sendEmitToWindow('exec', 'message', { msg: 'Валюты совпадают', level: 'message-error' })
        return
      }

      const srcAmount = Number(this.userCur[from].amount)
      const exchAmount = Number(UnIntlNumber(this.getDomElem('#cur-exchange-amount-id').value))

      if (exchAmount > srcAmount) {
        sendEmitToWindow('exec', 'message', {
          msg: `Доступно не более ${showNumber(srcAmount)} ${from}`,
          level: 'message-error'
        })
        return
      }

      if (exchAmount <= 0) {
        sendEmitToWindow('exec', 'message', {
          msg: `Введите сумму`,
          level: 'message-error'
        })
        return
      }

      renderPagePart(async () => {
        if (!(await this.exchange(from, to, exchAmount))) return

        sendEmitToWindow('exec', 'message', {
          msg: `Переведено ${showNumber(exchAmount)} ${from} в ${to}`,
          level: 'message-info'
        })

        const prevPos = this.userCurPaginator.curPaginIndex

        this.createUserCurPaginator(prevPos) // Чтобы пагинатор встал на ту же страницу, что и до обновления
        this.getDomElem('#cur-exchange-amount-id').value = ''

        return renderCurAmount(this.newProps)
      }, this.getDomElem('#user-cur-list-id'))
    }
  }
}
