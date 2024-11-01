import { el } from 'redom'
import { emit } from '../../js/shared'
import { renderCustomSelect } from '../CustomSelect/CustomSelect.jsx'

import PlusIcon from '../../assets/images/plus.svg'
import './AccHeader.css'

export function renderAccHeader(props) {
  return (
    <div class="flex-row flex-align-center flex-justify-spb cg-25 page-header">
      <div class="flex-row cg-25 acc-header-left">
        <h1 class="nobr page-header-font">Ваши счета</h1>
        <div id={props.params.domId}>{renderCustomSelect(props)}</div>
      </div>
      <button
        class="flex-row flex-align-center cg-10 flat-btn shared-btn btn-font"
        onClick={emit('accAddClick', {}, props.dest)}
      >
        <img src={PlusIcon} alt="" />
        <span class="control-btn-text">Создать новый счет</span>
      </button>
    </div>
  )
}
