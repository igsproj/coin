import { el } from 'redom'

import { renderCurAmount } from '../../components/CurAmount/CurAmount.jsx'
import { renderCurExchange } from '../../components/CurExchange/CurExchange.jsx'
import { renderCurRatesRealTime } from '../../components/CurRatesRealTime/CurRatesRealTime.jsx'

import './CurView.css'

export function renderCurView(props) {
  return (
    <section>
      <div class="flex-row flex-align-center page-header">
        <h1 class="nobr page-header-font">Валютный обмен</h1>
      </div>
      <div class="flex-row cg-50 cur-wrap">
        <div class="flex-column rg-50 cur-exchange">
          <div id="user-cur-list-id">{renderCurAmount(props)}</div>
          {renderCurExchange(props)}
        </div>
        <div id="cur-rates-real-time-id" class="cur-rates">
          {renderCurRatesRealTime({rates: []})}
        </div>
      </div>
    </section>
  )
}
