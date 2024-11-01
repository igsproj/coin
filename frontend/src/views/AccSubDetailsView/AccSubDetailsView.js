import { renderPagePart } from '../../js/shared.js'
import { transSubDetailsPaginationRec } from '../../js/init.js'

const { AppView } = await import('../../types/AppView.js')
const { ViewPaginator } = await import('../../types/Paginator.js')

const { renderAccSubDetailsView } = await import('./AccSubDetailsView.jsx')
const { renderBalanceHistory } = await import('../../components/BalanceHistory/BalanceHistory.jsx')

export class AccSubDetailsView extends AppView {
  prepareTransPaginator(fname, setPos) {
    const prepRes = this.transPaginator.prepare(fname, setPos)

    this.newProps.transactions = prepRes.data
    this.newProps.transPaginator = prepRes.props
  }

  createTransPaginator(setPos) {
    this.transPaginator = new ViewPaginator(
      this.srcTrans,
      transSubDetailsPaginationRec,
      'rtl',
      'transPaginator',
      this.viewId
    )

    let fname = setPos ? 'pos' : 'last'
    this.prepareTransPaginator(fname, setPos)
  }

  // func = 'prev' , 'next'
  renderTransPagination(func) {
    renderPagePart(async () => {
      this.prepareTransPaginator(func)

      return renderBalanceHistory(this.newProps)
    }, this.getDomElem('#acc-sub-balance-id'))
  }

  async getViewDom(mode, srcData) {
    this.newProps = Object.assign({}, srcData)
    this.srcTrans = srcData.transactions

    this.newProps.dest = this.viewId
    this.newProps.title = 'История баланса'
    this.newProps.backBtnEmit = 'accSubDetailsBackBtn'

    this.newProps.balanceChartBar = {
      id: 'balance-chart12-id',
      // id: autoDomId(), //TODO требуется доработка для авто id
      title: 'Динамика баланса',
      classWrap: 'rg-10 chart12',
      classCanvas: 'chart12-ad'
    }

    this.newProps.balanceChartStacked = {
      id: 'balance-chart12-stacked-id',
      // id: autoDomId(), //TODO требуется доработка для авто id
      title: 'Соотношение входящих исходящих транзакций',
      classWrap: 'rg-10 chart12',
      classCanvas: 'chart12-ad'
    }

    this.createTransPaginator()

    return renderAccSubDetailsView(this.newProps)
  }

  processEmit(emit, data, src) {
    // пагинаторов может быть несколько в одном view, поэтому нужно дополнительное поле data.src
    if (data.src === 'transPaginator') {
      if (emit === 'paginNext') this.renderTransPagination('next')
      if (emit === 'paginPrev') this.renderTransPagination('prev')
    }
  }
}
