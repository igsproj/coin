import { el } from 'redom'
import { emit } from '../../js/shared'

import { renderAccDetailsHeader } from '../../components/AccDetailsHeader/AccDetailsHeader.jsx'
import { renderTransForm } from '../../components/TransForm/TransForm.jsx'
import { renderBalanceChart } from '../../components/BalanceChart/BalanceChart.jsx'
import { renderBalanceHistory } from '../../components/BalanceHistory/BalanceHistory.jsx'

import './AccDetailsView.css'

export function renderAccDetailsView(props) {
  return (
    <section>
      {renderAccDetailsHeader(props)}
      <div class="flex-column rg-50">
        <div class="flex-row acc-details-top">
          <div class="acc-transfer-block">{renderTransForm(props)}</div>
          <div class="acc-chart-block pointer" onClick={emit('accSubDetails')}>{renderBalanceChart(props)}</div>
        </div>
        <div onClick={emit('accSubDetails')} class="pointer">
          {renderBalanceHistory(props)}
        </div>
      </div>
    </section>
  )
}
