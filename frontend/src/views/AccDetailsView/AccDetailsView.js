import { api, sendEmitToWindow, UnIntlNumber, makeStrOf, showAmount } from '../../js/shared.js'
import { saveAppSettings, readAppSettings, autoDomId } from '../../js/lib.js'

import cardValid from 'card-validator' // no dynamic import !!

import arrowDown from '../../assets/images/tri-down.svg'
import arrowUp from '../../assets/images/tri-up.svg'

import {
  appId,
  selectItemClass,
  selectItemsClass,
  selectInputClass,
  useMockChartData,
  useThisYearData,
  maxLastTransactions
} from '../../js/init.js'

const { renderAccDetailsView } = await import('./AccDetailsView.jsx')

const { AppView } = await import('../../types/AppView.js')
const { CustomSelect } = await import('../../components/CustomSelect/CustomSelect.js')
const { cardLogos } = await import('../../js/cards.js')
const { MaskInput } = await import('maska')

export class AccDetailsView extends AppView {
  data = {} // исходный счет + все его транзакции

  year = useThisYearData ? new Date().getFullYear() : false // данные по транзакциям :только за год или используем все
  chartData = null

  constructor(domRootId, appMountId, viewId) {
    super(domRootId, appMountId, viewId)

    this.transAccId = autoDomId()
    this.transAmountId = autoDomId()
    this.transLogoId = autoDomId()

    this.inputAccSelect = new CustomSelect(autoDomId(), 'accToClick', 'accToCheckItem')

    this.inputAccProps = {
      params: this.inputAccSelect,
      dest: this.viewId,
      readOnly: false,
      openBy: 'img',
      openImg: arrowDown,
      closeImg: arrowUp,
      closeOnSelect: true,
      // selectPlaceholder: 'test', // не работает в режиме редактора (как в этом случае)
      permanentPlaceHolder: 'Введите счет', // показывает обычный placeholder
      // selectWrap: '',
      onInputText: 'accInputText',
      inputId: this.transAccId,
      inputClass: selectInputClass + ' account-input',
      itemClass: selectItemClass,
      itemsClass: selectItemsClass
    }
  }

  async loadPageData(accId) {
    return await api(`/account/${accId}`, { method: 'GET' }, async (httpRes) => {
      this.data = httpRes.payload
      return true
    })
  }

  getTransferDescr(accType, cardType) {
    const descr = {
      card: `на карту ${cardType}`,
      account: 'на счет'
    }
    return descr[accType] ?? ''
  }

  async transferMoney(from, to, amount, accType, cardType) {
    const body = {
      from: from,
      to: to,
      amount: amount
    }

    return await api(
      `/transfer-funds`,
      {
        body: JSON.stringify(body),
        method: 'POST'
      },
      async (httpRes) => {
        this.saveUsedAcc(to) // запомнить счет

        sendEmitToWindow('exec', 'accOpenClick', this.data) // обновить текущую страницу
        sendEmitToWindow('exec', 'message', {
          msg: `Переведено ${showAmount(amount)} ${this.getTransferDescr(accType, cardType)} ${to}`,
          level: 'message-info'
        })
        // обновление 'accListView' идет по кнопке возврата из данной страницы, не нужно дублировать
        //sendEmitToWindow('exec', 'renderPage', { view: 'accListView' }) // установить признак, что при возврате в список счетов, страницу тоже обновить
      }
    )
  }

  saveUsedAcc(to) {
    if (!this.inputAccSelect.items.includes(to)) this.inputAccSelect.addItem(to, to)

    const accounts = readAppSettings(appId).toAcc ?? []

    if (!accounts.includes(to)) {
      accounts.push(to)
      saveAppSettings(appId, () => ({ toAcc: accounts }))
    }
  }

  onChangeAcc(setFocus) {
    this.getDomElem(`#${this.transAccId}`, null, true)
    this.createMasks([this.transAccId])
    if (setFocus) this.getDomElem(`#${this.transAccId}`).focus()
  }

  showCardLogo(cardNumber) {
    const cardLogo = this.getDomElem(`#${this.transLogoId}`)
    const valid = cardValid.number(cardNumber)

    if (valid.card && valid.isPotentiallyValid) {
      cardLogo.src = cardLogos[valid.card.type]
      cardLogo.classList.remove('hide')
    } else cardLogo.classList.add('hide')
  }

  createMasks(forId) {
    if (!Array.isArray(forId)) {
      console.error('createMasks : <forId> should be an array ')
      return
    }

    forId.forEach((elem) => {
      if (elem === this.transAccId)
        new MaskInput(`#${elem}`, {
          mask: makeStrOf('#', 28)
        })

      if (elem === this.transAmountId)
        new MaskInput(`#${elem}`, {
          number: {
            locale: 'ru',
            fraction: 2,
            unsigned: true
          }
        })
    })
  }

  /*****************************************
  API
  *****************************************/

  createAllMasks() {
    this.createMasks([this.transAccId, this.transAmountId])
  }

  getChartData(numOfMonth, emptyIfNoData = true) {
    return this.chartData
      ? this.chartData.getChartData(numOfMonth, emptyIfNoData)
      : ChartData.chartStruct
  }

  async getViewDom(mode, srcData) {
    const { ChartData } = await import('../../types/ChartData.js')

    if (!(await this.loadPageData(srcData.account))) return false

    this.chartData = new ChartData(this.year, this.data.transactions, this.data.account)

    let mockMsg = 'Использую реальные транзакции'
    let level = 'message-info'

    if (this.chartData.isUsingMocking(useMockChartData)) {
      mockMsg = 'Использую тестовые транзакции'
      level = 'message-warn'
    }

    sendEmitToWindow('exec', 'message', { msg: mockMsg + ' для ' + srcData.account, level: level })

    this.chartData.reloadChartData(useMockChartData)
    this.chartData.addChartData(6)
    this.chartData.addChartData(12)

    this.data.transactions = this.chartData.srcData //!!! заменяем исходные транзакции с учетом возможного mock

    this.newProps = Object.assign({}, srcData)

    this.newProps.balanceChartBar = {
      id: 'balance-chart6-id',
      // id: autoDomId(), //TODO требуется доработка для авто id
      title: 'Динамика баланса',
      classWrap: 'rg-10 chart6',
      classCanvas: 'chart6-ad'
    }

    this.newProps.transfer = {
      sendBtnEmit: 'accDetailsSendBtn',
      amountInput: 'amountInputText',
      cardLogoId: this.transLogoId,
      amountId: this.transAmountId,
      placeholder: 'Введите сумму'
    }

    this.newProps.title = 'Просмотр счета'
    this.newProps.balance = this.data.balance
    this.newProps.backBtnEmit = 'accDetailsBackBtn'
    this.newProps.dest = this.viewId

    this.inputAccSelect.empty = true
    this.inputAccSelect.checked = -1
    this.inputAccSelect.curValue = ''

    this.inputAccSelect.hideClass = 'none'
    this.newProps.accSelector = this.inputAccProps

    this.newProps.transPaginator = {
      pagination: 'none'
    }

    const startIndex = this.data.transactions.length - maxLastTransactions
    this.newProps.transactions = this.data.transactions.slice(startIndex < 0 ? 0 : startIndex) // Последние 10 транзакций

    // нужно загрузить список счетов, на которые уже переводили
    const accounts = readAppSettings(appId).toAcc ?? []
    this.inputAccSelect.cleanItems()

    for (let i = 0; i < accounts.length; ++i)
      if (accounts[i] !== this.data.account) this.inputAccSelect.addItem(accounts[i], accounts[i])

    return renderAccDetailsView(this.newProps)
  }

  processEmit(emit, data, src) {
    const inputAccValue = this.getDomElem(`#${this.transAccId}`).value
    const inputAmountValue = this.getDomElem(`#${this.transAmountId}`).value

    this.inputAccSelect.curValue = inputAccValue
    this.inputAccSelect.select(
      emit,
      this.lastEmit,
      this.inputAccProps,
      data.key,
      this.getDomElem.bind(this),
      (elem) => {
        this.onChangeAcc(true)
        this.showCardLogo(this.inputAccSelect.getChecked().descr)
        this.inputAccSelect.checked = -1
      },
      (elem) => {
        this.onChangeAcc()
      },
      (elem) => {
        this.onChangeAcc(true)
      }
    )

    if (emit === 'accDetailsSendBtn') {
      if (inputAmountValue <= 0) {
        sendEmitToWindow('exec', 'message', { msg: 'Введите сумму', level: 'message-error' })
        return
      }

      const amount = Number(UnIntlNumber(inputAmountValue))
      if (amount > this.data.balance) {
        sendEmitToWindow('exec', 'message', {
          msg: `Нельзя отправить больше чем есть на счете`,
          level: 'message-error-critical'
        })
        return
      }

      const to = UnIntlNumber(inputAccValue) // счет получателя
      const accLen = to.length
      let accType = 'account'
      let cardType = ''

      if (accLen < 16) {
        sendEmitToWindow('exec', 'message', {
          msg: 'Длина номера для карт не меньше 16, а для счетов >= 26 символов',
          level: 'message-error'
        })
        return
      }

      // >= 26 симв это счета
      if (accLen >= 16 && accLen < 26) {
        // возможно это карта
        const valid = cardValid.number(inputAccValue)

        if (valid.card) {
          if (!valid.isValid) {
            sendEmitToWindow('exec', 'message', {
              msg: 'Карт счет не прошел валидацию',
              level: 'message-error-critical'
            })
            return
          } else {
            accType = 'card'
            cardType = valid.card.type
          }
        }
      }

      const from = UnIntlNumber(this.data.account)

      // проверка на отправку на текущий счет - сравниваем счета как строки, но убираем из них все кроме цифр
      if (from === to) {
        sendEmitToWindow('exec', 'message', {
          msg: 'Нельзя отправить на тот же счет',
          level: 'message-error-critical'
        })
        return
      }

      this.transferMoney(from, to, amount, accType, cardType)
    }

    if (emit === 'accInputText') this.showCardLogo(inputAccValue)
  }
}
