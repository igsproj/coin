import { el } from 'redom'

import { showNumber } from '../../js/shared'
import './CurRatesRealTime.css'

import GreenTriUpIcon from '../../assets/images/green-tri-up.svg'
import RedTriDownIcon from '../../assets/images/red-tri-down.svg'

export function renderCurRatesRealTime(props) {
  return (
    <div class="flex-column info-block info-block-cur info-block-gray rates-real-time">
      <span class="block-header-font">Изменение курсов в реальном времени</span>

      <ul className="list-reset flex-column rg-25">
        {props.rates.map((elem) => (
          <li class="flex-row flex-justify-spb cg-10">
            <div class="flex-row cg-10 cur-descr-left">
              <span class="nobr cur-text-font">{props.pair}</span>
              <div class={`dashed ${elem.change > 0 ? 'rate-color-up' : 'rate-color-down'}`}></div>
            </div>
            <div class="flex-row flex-align-start cur-descr-right cg-15">
              <span class="cur-text-amount">{showNumber(elem.rate)}</span>
              <img src={elem.change > 0 ? GreenTriUpIcon : RedTriDownIcon} class="rate-tri" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
