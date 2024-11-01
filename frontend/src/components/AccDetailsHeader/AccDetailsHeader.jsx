import { el } from 'redom'
import { emit, showAmount } from '../../js/shared'

import BackIcon from '../../assets/images/arrow.svg'
import './AccDetailsHeader.css'

export function renderAccDetailsHeader(props) {
  return (
    <div class="flex-column page-header">
      <div class="flex-row flex-justify-spb">
        <h1 class="nobr page-header-font">{props.title}</h1>
        <button
          id="btn-back-id"
          class="flex-row flex-align-center cg-10 flat-btn shared-btn btn-font"
          onClick={emit(props.backBtnEmit)}
        >
          <img src={BackIcon} alt="" />
          <span class="control-btn-text">Вернуться назад</span>
        </button>
      </div>
      <div class="flex-row flex-justify-spb flex-align-center cg-25 rg-25 header-balance-wrap">
        <span class="acc-number">№ {props.account}</span>
        <div class="flex-row flex-justify-spb cg-10 header-balance">
          <span class="balance-text">Баланс</span>
          <span class="balance-amount">{showAmount(props.balance)}</span>
        </div>
      </div>
    </div>
  )
}
