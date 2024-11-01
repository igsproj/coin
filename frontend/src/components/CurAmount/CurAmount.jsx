import { el } from 'redom'

import { showNumber } from '../../js/shared'
import { renderPaginatorControls } from '../../components/PaginatorControls/PaginatorControls.jsx'

import './CurAmount.css'

export function renderCurAmount(props) {
  return (
    <div class="flex-column info-block info-block-cur info-block-white cur-amount">
      <div class="flex-row flex-justify-spb flex-align-center">
        <span class="block-header-font">Ваши валюты</span>
        {renderPaginatorControls(props.userCurPaginator ?? {})}
      </div>
      <ul className="list-reset flex-column rg-25">
        {Object.keys(props.userCur).map((id) => (
          <li class="flex-row flex-justify-spb cg-10">
            <div class="flex-row cg-10 cur-descr-left">
              <span class="cur-text-font">{props.userCur[id].code}</span>
              <div class="dashed"></div>
            </div>
            <span class="cur-text-amount">{showNumber(props.userCur[id].amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
