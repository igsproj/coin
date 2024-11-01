import { el } from 'redom'

import { renderAccHeader } from '../../components/AccHeader/AccHeader.jsx'
import { renderAccList } from '../../components/AccList/AccList.jsx'

import './AccListView.css'

export function renderAccListView(props) {
  return (
    <section>
      {renderAccHeader(props.select)}
      <div id={props.accListId}>{renderAccList(props.accounts)}</div>
    </section>
  )
}
