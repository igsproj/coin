import { el } from 'redom'
import { emit } from '../../js/shared'

import './HeaderNav.css'

export function renderHeaderNav(props) {
  return (
    <ul class="list-reset flex-row header-nav">
      {Object.keys(props.items).map((key) => (
        <li>
          <button id={key} class="flat-btn header-btn btn-font" onClick={emit(props.emit, { id: key })}>
            {props.items[key].descr}
          </button>
        </li>
      ))}
    </ul>
  )
}
