import { el } from 'redom'
import { renderCustomSelect } from '../CustomSelect/CustomSelect.jsx'
import { emit } from '../../js/shared.js'

import './CurExchange.css'

export function renderCurExchange(props) {
  return (
    <div class="flex-column info-block info-block-cur info-block-white">
      <span class="block-header-font">Обмен валюты</span>

      <div className="flex-row cg-25 rg-25 cur-exchange-wrap">
        <div className="flex-column rg-25">
          <div className="flex-row flex-align-center cg-12">
            <span class="dlg-label-font">Из</span>
            <div id={props.selectPropsFrom.params.domId}>{renderCustomSelect(props.selectPropsFrom)}</div>
            <span class="dlg-label-font">в</span>
            <div id={props.selectPropsTo.params.domId}>{renderCustomSelect(props.selectPropsTo)}</div>
          </div>

          <div className="flex-row flex-align-center cg-12">
            <span class="dlg-label-font">Сумма</span>
            <input class="custom-select-input dlg-input-font cur-exchange-amount" type="text" id="cur-exchange-amount-id"/>
          </div>
        </div>
        <button class="flat-btn shared-btn btn-font" onClick={emit('curExchange', {}, props.dest)}>Обменять</button>
      </div>
    </div>
  )
}
