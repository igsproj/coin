import { el } from 'redom'
import { renderPaginatorControls } from '../../components/PaginatorControls/PaginatorControls.jsx'
import { formatDate, formatAmount } from '../../js/shared'

import './BalanceHystory.css'

const formatStr = { day: '2-digit', month: '2-digit', year: 'numeric' }

export function renderBalanceHistory(props) {
  // console.log(props)
  return (
    <div class="flex-column info-block info-block-gray">
      <div class="flex-row flex-justify-spb">
        <span class="block-header-font">История переводов</span>
        {renderPaginatorControls(props.transPaginator ? props.transPaginator : {})}
      </div>

      <div class="balance-hystory">
        <div class="flex-row balance-hystory-head">
          <span class="balance-hystory-col1 tab-header-font">Счет отправителя</span>
          <span class="balance-hystory-col2 tab-header-font">Счет получателя</span>
          <span class="balance-hystory-col3 tab-header-font">Сумма</span>
          <span class="balance-hystory-col4 tab-header-font">Дата</span>
        </div>

        {props.transactions.map((elem) => (
          <div class="flex-row balance-hystory-row">
            <span class="balance-hystory-col1 tab-row-font">{elem.from}</span>
            <span class="balance-hystory-col2 tab-row-font">{elem.to}</span>
            <span
              class={`balance-hystory-col3 tab-row-font ${elem.to === props.account ? 'balance-plus' : 'balance-minus'}`}
            >
              {formatAmount(elem.amount, elem.to === props.account)}
            </span>
            <span class="balance-hystory-col4 tab-row-font">{formatDate(elem.date, formatStr)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
