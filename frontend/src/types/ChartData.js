import { cloneObj, getRandomFromTo } from '../js/lib.js'
import {
  shortMonthInChart,
  excludedAccounts,
  shortYearInChart,
  ratioMinOrMax,
  showChartData
} from '../js/init.js'
import { formatDate } from '../js/shared.js'

export class ChartData {
  countedData = {} // все агрегированные данные по годам и месяцам на основе транзакций (this.srcData) (обычно за посл год)
  chartData = {} // данные из chart по месяцам (напр chartData["12"] за посл 12 мес, chartData["6"] - за посл 6 мес). За 6 и 12 мес данные создаются сразу в reloadChartData()

  static chartStruct = {
    months: [],
    amount: [],
    income: [],
    outcome: [],
    ratio: [],
    amountSorted: [],
    ratioRes: {}
  } // это шаблон данных для вывода графика

  constructor(year, srcData, account) {
    this.year = year
    this.srcData = srcData // все исходные транзакции счета
    this.account = account // сам счет
  }

  // считаем приход / расход по месяцам за год или (если год не указан), то за весь период
  countChartData(year, srcData) {
    let data = srcData
    const res = {}

    for (let i = 0; i < data.length; ++i) {
      const trans = data[i]
      const date = new Date(trans.date)
      const curYear = date.getFullYear()

      if (year && curYear !== year) continue

      if (!res[curYear]) res[curYear] = {}

      const curMonth = date.getMonth()

      if (!res[curYear][curMonth]) res[curYear][curMonth] = { income: 0, outcome: 0 }

      // приход
      if (trans.to === this.account) res[curYear][curMonth].income += trans.amount
      // расход
      else res[curYear][curMonth].outcome += trans.amount
    }

    return res
  }

  /**********************************************
   Алгоритм подсчета соотношения транзакций : скорее всего достаточно просто получать разницу сумм! (см countTotal)
  **********************************************/
  getRatio(income, outcome) {
    const fullSum = income + outcome // полная сумма транзакции (без вычитания!) будет 100%

    // выделяем сколько процентов в итоговой сумме занимает приход и расход
    const incomePerc = (income * 100) / fullSum
    const outcomePerc = (outcome * 100) / fullSum

    // получаем соотношение max / min
    const min = Math.min(incomePerc, outcomePerc)
    const max = Math.max(incomePerc, outcomePerc)
    const ratioPerc = (max === incomePerc + outcomePerc ? 0 : max) / (min === 0 ? 1 : min)

    // получаем результат соотношения
    return {
      income: income,
      outcome: outcome,
      incomePerc: incomePerc,
      outcomePerc: outcomePerc,
      fullSum: fullSum,
      min: min,
      max: max,
      ratioPerc: Number(ratioPerc.toFixed(2)),
      ratioSum: Math.abs(income - outcome) //Number(((ratioPerc * fullSum) / 100).toFixed(2))
    }
  }

  // при mode = 'ratioSum' считаем максимальную разницу в суммах транзакций
  countTotal(res, maxOrMin, mode = 'ratioSum') { // mode : ratioPerc / ratioSum
    res.amountSorted = res.amount.toSorted((a, b) => a - b)

    for (let i = 0; i < res.ratio.length; ++i) {
      if (res.ratio[i].ratioPerc === 0 || i === 0) continue

      if (maxOrMin === 'min' || !maxOrMin)
        if (res.ratio[i][mode] < res.ratio[i - 1][mode]) res.ratioRes = res.ratio[i]

      if (maxOrMin === 'max')
        if (res.ratio[i][mode] > res.ratio[i - 1][mode]) res.ratioRes = res.ratio[i]
    }
  }

  prepareChartData(year, numOfMonth) {
    const formatStr = { month: 'long' }
    const res = cloneObj(ChartData.chartStruct) // !!!! Object.assign({}, source) и {...source} добавляют source как ссылки! если менять что-то в source, будет меняться в результате     // { months: [], amount: [], income: [], outcome: [] }
    const years = year ? [String(year)] : Object.keys(this.countedData)

    years.sort((a, b) => Number(a) - Number(b)) // годы должны обязательно идти по возрастанию

    for (let y = years.length - 1; y >= 0; --y) {
      const data = this.countedData[years[y]]

      if (!data) return res

      const months = Object.keys(data)

      months.reverse()

      const endMonth = Math.min(numOfMonth, months.length)

      for (let i = 0; i < endMonth; ++i) {
        const monthNumber = months[i]

        let monthDescr = formatDate(new Date(years[y], monthNumber, 1).toString(), formatStr)
        if (shortMonthInChart) monthDescr = monthDescr.slice(0, 3)

        // только если выводим за несколько лет
        if (!year) monthDescr += shortYearInChart ? ` ${years[y].slice(2)}` : ` ${years[y]}` // 2 или 4 цифры года

        res.months.unshift(monthDescr)

        const income = data[monthNumber].income
        const outcome = data[monthNumber].outcome

        res.amount.unshift(income - outcome)

        res.income.unshift(income)
        res.outcome.unshift(outcome)

        res.ratio.unshift(this.getRatio(income, outcome))

        if (res.months.length === numOfMonth) {
          this.countTotal(res, ratioMinOrMax)
          return res
        }
      }
    }

    this.countTotal(res, ratioMinOrMax)
    return res
  }

  isUsingMocking(useMockChartData) {
    return useMockChartData && !excludedAccounts.includes(this.account)
  }

  reloadChartData(useMockChartData) {
    if (this.isUsingMocking(useMockChartData))
      this.srcData = this.mockChartData(this.year, this.srcData)

    this.countedData = this.countChartData(this.year, this.srcData, useMockChartData) // полные данные по всем годам (или за год)
  }

  addChartData(numOfMonth) {
    this.chartData[String(numOfMonth)] = this.prepareChartData(this.year, numOfMonth) // создаем данные за новый период
    return this.chartData[String(numOfMonth)]
  }

  getChartData(numOfMonth, emptyIfNoData = true) {
    let data = this.chartData[String(numOfMonth)]

    if (!emptyIfNoData && !data) data = addChartData(numOfMonth)

    if (emptyIfNoData && !data) data = ChartData.chartStruct // пустой объект

    if (showChartData) console.log(data)

    return data
  }

  // формируем mock данные за год на основании данных от сервера
  mockChartData(year, data) {
    const today = new Date()
    const newData = []

    for (let i = 0; i < data.length; ++i) {
      const trans = data[i]
      const date = new Date(trans.date)
      const curYear = date.getFullYear()
      const curMonth = date.getMonth()

      if (year && curYear !== year) continue

      if (curMonth === today.getMonth() || curMonth === today.getMonth() - 1) {
        // оставляем транзакции за последние месяцы без изменений
        newData.push(cloneObj(trans))
      }

      for (let month = 0; month < today.getMonth() - 1; ++month) {
        if (!Boolean(getRandomFromTo(0, 1))) continue

        const newTrans = cloneObj(trans)

        if (Boolean(getRandomFromTo(0, 1))) {
          const tmp = newTrans.from
          newTrans.from = newTrans.to
          newTrans.to = tmp
        }

        if (!Boolean(getRandomFromTo(0, 1)))
          newTrans.amount = newTrans.amount - (getRandomFromTo(10, 90) * newTrans.amount) / 100
        else newTrans.amount = newTrans.amount + (getRandomFromTo(10, 90) * newTrans.amount) / 100

        const transDate = year ? curYear : curYear - getRandomFromTo(0, 1)
        newTrans.date = new Date(transDate, month, getRandomFromTo(1, 28)).toString() // year, monthIndex, day

        newData.push(newTrans)
      }
    }

    return newData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
}
