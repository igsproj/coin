import { el } from 'redom'
import { emit, formatDate, showAmount } from '../../js/shared'

import './AccList.css'

const formatStr = { day: '2-digit', month: 'long', year: 'numeric' }

export function renderAccList(props) {
  return (
    <ul class="list-reset account-list">
      {props.items.map((elem) => (
        <li
          class="flex-column flex-justify-spb account-item"
          // id={`acc-${elem.account}-id`}
          key={elem.account}
        >
          <div class="flex-column rg-9">
            <span class="account">{elem.account}</span>
            <span class="balance">{showAmount(elem.balance)}</span>
          </div>
          <div class="flex-row flex-justify-spb flex-align-end account-bottom">
            <div class="flex-column">
              <span class="last-trans-text">Последняя транзакция :</span>
              <span class="last-trans-date">
                {elem.transactions.length ? formatDate(elem.transactions[0].date, formatStr) : ''}
              </span>
            </div>

            <button
              class="flat-btn shared-btn btn-font"
              onClick={
                // emit('renderPage', { view: 'accDetailsView' }) +
                // '; ' +
                emit('accOpenClick', elem)
              }
            >
              Открыть
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
