import { el } from 'redom'
import { jsxAttr } from '../../js/shared'

import './BalanceChart.css'

export function renderBalanceChart(props) {
  return (
    <div
      {...jsxAttr(
        'class',
        `flex-column info-block info-block-white ${props.balanceChartBar.classWrap ?? ''}`
      )}
    >
      <span class="block-header-font">{props.balanceChartBar.title}</span>
      <canvas
        id={props.balanceChartBar.id}
        {...jsxAttr('class', `${props.balanceChartBar.classCanvas ?? ''}`)}
      ></canvas>
    </div>
  )
}
