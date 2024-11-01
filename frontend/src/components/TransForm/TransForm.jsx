import { el } from 'redom'
import { emit, jsxAttr } from '../../js/shared'
import { renderCustomSelect } from '../CustomSelect/CustomSelect.jsx'

import MailIcon from '../../assets/images/mail.svg'
import './TransForm.css'

export function renderTransForm(props) {
  return (
    <form name="trans-form" class="flex-column info-block info-block-gray trans-form">
      <span class="block-header-font">Новый перевод</span>

      <div className="flex-row flex-justify-start cg-18">
        <div class="flex-column flex-justify-spb trans-dlg-left">
          <span class="dlg-label-font trans-label-acc">Номер&nbsp;счета получателя</span>
          <span class="dlg-label-font trans-label-amount">Сумма перевода</span>
        </div>

        <div className="flex-column rg-25 trans-dlg-right">
          <div
            class="trans-form-input acc-selector"
            {...jsxAttr('id', props.accSelector.params.domId ?? '')}
          >
            {renderCustomSelect(props.accSelector)}
          </div>
          <input
            type="text"
            class="custom-select-input trans-form-input dlg-input-font amount-input"
            {...jsxAttr('id', props.transfer.amountId ?? '')}
            {...jsxAttr('placeholder', props.transfer.placeholder ?? '')}
          />
          <div class="flex-row flex-justify-spb trans-form-bottom">
            <button
              type="button"
              class="flex-row flex-align-center cg-10 flat-btn shared-btn btn-font send-trans-btn"
              onClick={emit(props.transfer.sendBtnEmit, {}, props.dest)}
            >
              <img src={MailIcon} alt="" />
              <span>Отправить</span>
            </button>
            <img
              {...jsxAttr('id', props.transfer.cardLogoId ?? '')}
              class="img-auto card-logo hide"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
