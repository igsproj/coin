import { el } from 'redom'

import { renderAccDetailsHeader } from '../../components/AccDetailsHeader/AccDetailsHeader.jsx'
import { renderBalanceChart } from '../../components/BalanceChart/BalanceChart.jsx'
import { renderBalanceChartStacked } from '../../components/BalanceChartStacked/BalanceChartStacked.jsx'
import { renderBalanceHistory } from '../../components/BalanceHistory/BalanceHistory.jsx'

import './AccSubDetailsView.css'

export function renderAccSubDetailsView(props) {
  return (
    <section>
      {renderAccDetailsHeader(props)}
      <div class="flex-column rg-50">
        {renderBalanceChart(props)}
        {renderBalanceChartStacked(props)}
        <div id="acc-sub-balance-id">{renderBalanceHistory(props)}</div>
      </div>
    </section>
  )
}
