import { el } from 'redom'
import { jsxAttr } from '../../js/shared'

import './BalanceChartStacked.css'

export function renderBalanceChartStacked(props) {
  return (
    <div
      {...jsxAttr(
        'class',
        `flex-column info-block info-block-white ${props.balanceChartBar.classWrap ?? ''}`
      )}
    >
      <span class="block-header-font">{props.balanceChartStacked.title}</span>
      <canvas
        id={props.balanceChartStacked.id}
        {...jsxAttr('class', props.balanceChartBar.classCanvas ?? '')}
      ></canvas>
    </div>
  )
}
