import './css/normalize.css'
import './css/init.css'
import './css/helpers.css'
import './css/fonts.css'
import './css/style.css'
import './css/animation.css'
import './css/media.css'

import bk from './assets/images/bk.webp'

import { delay, checkFoundDom, ifaceStateChange } from './js/lib.js'
import { sendEmitToWindow } from './js/shared.js'
import { eventEndDelay, ratioMinOrMax, logAttrUpdate, appLoadDelay } from './js/init.js'

/***********************************************************
init
***********************************************************/
const spinner = document.getElementById('spinner-id')
checkFoundDom(spinner, 'spinner')
spinner.setAttribute('src', bk)

const spinnerHead = document.getElementById('spinner-head-id')
checkFoundDom(spinnerHead, 'spinnerHead')
spinnerHead.setAttribute('src', bk)

const logoText = document.getElementById('logo-text-id')
checkFoundDom(logoText, 'logoText')

sessionStorage.setItem('apiRoot', 'http://localhost:3000')
sessionStorage.setItem('apiWebSocket', 'ws://localhost:3000')

/***********************************************************
views
***********************************************************/
const {
  createChartStacked,
  createChartSimple,
  createTicks,
  chartFontSizeXY,
  chartTickPadding,
  chartBarSizePx
} = await import('./js/charts.js')

const { initPages } = await import('./pages/pages.js')

const pages = initPages(processEmits)

pages.registerCb(
  'accDetailsView',
  () => {
    pages.getView('accDetailsView').createAllMasks()
    const chartData = pages.getView('accDetailsView').getChartData(6)

    chartSimple6 = createChartSimple('balance-chart6-id', chartData, (val, index, ticks) =>
      createTicks('number', val, ticks)
    )
  },
  () => updateChartsAdaptive('chart6')
)

pages.registerCb(
  'accSubDetailsView',
  () => {
    const chartData = pages.getView('accDetailsView').getChartData(12)
    chartSimple12 = createChartSimple('balance-chart12-id', chartData, (val, index, ticks) =>
      createTicks('amount', val, ticks)
    )

    const ticksValues = [chartData.ratioRes.ratioSum, chartData.amountSorted.at(-1)] // своя шкала по y
    if (ratioMinOrMax === 'max') ticksValues.unshift(0)

    chartStacked12 = createChartStacked(
      'balance-chart12-stacked-id',
      chartData,
      (val, index, ticks) => createTicks('amountStacked', val, ticks, chartData.ratioRes.ratioSum),
      (axis) => (axis.ticks = ticksValues.map((v) => ({ value: v })))
    )
  },
  () => updateChartsAdaptive('chart12')
)

// для показа спиннера при загрузке view
pages.setSendRenderEvent('accDetailsView', true)
pages.setSendRenderEvent('curView', true)
pages.setSendRenderEvent('accListView', true)

/***********************************************************
charts
***********************************************************/
const { Adaptive } = await import('./types/Adaptive.js')

let chartSimple6 = null,
  chartSimple12 = null,
  chartStacked12 = null

// font size
const chartFontAdaptive = new Adaptive(updateChartsFont, 12)
chartFontAdaptive.add(600, updateChartsFont, 16)
chartFontAdaptive.add(900, updateChartsFont, 20)

// ticks padding
const chartTickAdaptive = new Adaptive(updateChartsTickPadding, { chart6: 2, chart12: 2 })
chartTickAdaptive.add(600, updateChartsTickPadding, { chart6: 5, chart12: 10 })
chartTickAdaptive.add(900, updateChartsTickPadding, { chart6: 20, chart12: 25 })
chartTickAdaptive.add(1250, updateChartsTickPadding, { chart6: 20, chart12: 45 })

// bar size chart 6
const chartBarAdaptive6 = new Adaptive(() => chartBarSizePx(chartSimple6, 0))
chartBarAdaptive6.add(600, () => chartBarSizePx(chartSimple6, 50))
chartBarAdaptive6.add(1220, () => chartBarSizePx(chartSimple6, 0))
chartBarAdaptive6.add(1245, () => chartBarSizePx(chartSimple6, 50))

// bar size chart 12
const chartBarAdaptive12 = new Adaptive(updateChartsBarSize12, 0)
chartBarAdaptive12.add(900, updateChartsBarSize12, 50)

// run
main()

/***********************************************************
functions
***********************************************************/
// ticks
function updateChartsTickPadding(padding, mode) {
  if (mode.includes('chart6'))
    return chartTickPadding(chartSimple6, 'y', padding.chart6)

  if (mode.includes('chart12')) {
    return (chartTickPadding(chartSimple12, 'y', padding.chart12) +
    chartTickPadding(chartStacked12, 'y', padding.chart12))
  }
}

// bar size chart 12
function updateChartsBarSize12(sizePx) {
  return (chartBarSizePx(chartSimple12, sizePx) +
  chartBarSizePx(chartStacked12, sizePx))
}

// font size
function updateChartsFont(fontSize, mode) {
  if (mode.includes('chart6')) return chartFontSizeXY(chartSimple6, fontSize)

  if (mode.includes('chart12')) {
    return (chartFontSizeXY(chartSimple12, fontSize) +
    chartFontSizeXY(chartStacked12, fontSize))
  }
}

async function afterLogin() {
  pages.hide('loginView') // скроем сразу диалог login, чтобы не ждать загрузки счетов
  sendEmitToWindow('exec', 'message', {
    msg: `Вход в систему : ${sessionStorage.getItem('login')}`,
    level: 'message-info'
  })

  if (await pages.showView('headerNavView'))
    // по умолчанию нужно выбрать пунт "счета"
    pages.getView('headerNavView').select('navBtn2')
}

async function processEmits(emit, data, pages) {
  if (emit === 'message') pages.getView('messageCenter').showMessage(data.msg, data.level)

  if (emit === 'accOpenClick') {
    if (!data.transactions.length) {
      sendEmitToWindow('exec', 'message', {
        msg: `Данный счет пока пустой. Сделайте на него перевод`,
        level: 'message-info'
      })
      return
    }

    pages.getView('headerNavView').unselect()
    pages.setRenderIt('accDetailsView')
    pages.setRenderIt('accSubDetailsView')

    await pages.showView('accDetailsView', '', data)
  }

  if (emit === 'accDetailsBackBtn') pages.getView('headerNavView').select('navBtn2')

  if (emit === 'accSubDetails')
    await pages.showView('accSubDetailsView', '', pages.getView('accDetailsView').data)

  if (emit === 'accSubDetailsBackBtn') await pages.showView('accDetailsView')

  if (emit === 'loginBtnClick') if (await pages.getView('loginView').login()) afterLogin()

  if (emit === 'navBtnClick') pages.getView('headerNavView').onNavClick(data.id)

  if (['mapsLoadBegin', 'viewRenderBegin', 'loginBegin', 'addAccountBegin'].includes(emit))
    spinnerHeader(true)

  if (['mapsLoadEnd', 'viewRenderEnd', 'loginEnd', 'addAccountEnd'].includes(emit)) {
    setTimeout(() => spinnerHeader(false), emit === 'loginEnd' ? 0 : eventEndDelay) // Минимальное время показа спинера = eventEndDelay (кроме случая с login)
  }
}

function spinnerHeader(show) {
  ifaceStateChange(show, [true, false], (state1, state2) => {
    logoText.classList[state1]('none')
    spinnerHead.classList[state2]('none')
  })
}

function updateChartsAdaptive(param) {
  const view = pages.getActiveView('app-view-id')
  // if (!param && !(view instanceof AppView)) return
  if (!param && !view) return

  let cnt = 0
  let chartId = ''

  if (view.viewId === 'accDetailsView' || param === 'chart6') {
    chartId = 'chart6'
    cnt += chartBarAdaptive6.useAdaptive() ? 1 : 0
  }

  if (view.viewId === 'accSubDetailsView' || param === 'chart12') {
    chartId = 'chart12'
    cnt += chartBarAdaptive12.useAdaptive() ? 1 : 0
  }

  cnt += chartFontAdaptive.useAdaptive([chartId]) ? 1 : 0
  cnt += chartTickAdaptive.useAdaptive([chartId]) ? 1 : 0

  // Обновление объекта графика (после всех изменений), хотя вроде и без этого работает ?
  if (cnt > 0) {
    if (chartId === 'chart6') {
      if (logAttrUpdate)
        console.log(`update chart6 : ${cnt}`)
      chartSimple6.update()
    }

    if (chartId === 'chart12') {
      if (logAttrUpdate)
        console.log(`update chart12 : ${cnt}`)
      chartSimple12.update()
      chartStacked12.update()
    }
  }
}

async function main() {
  window.addEventListener('load', async () => {
    await delay(appLoadDelay)

    spinner.style.display = 'none'

    const header = document.getElementsByTagName('header')
    header[0].style.display = 'block'

    const main = document.getElementsByTagName('main')
    main[0].style.display = 'block'
  })

  window.addEventListener('resize', updateChartsAdaptive)

  await pages.showView('messageCenter')
  if (!sessionStorage.getItem('token')) pages.showView('loginView')
  else afterLogin() // вход по текущей сохраненной сессии
}
