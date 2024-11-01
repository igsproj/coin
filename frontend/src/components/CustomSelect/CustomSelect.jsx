import { el } from 'redom'
import { emit, jsxAttr } from '../../js/shared'

import './CustomSelect.css'

function selectValue(props) {
  // показать старое значение
  if (props.params.empty && props.params.checked === -1)
    return props.params.curValue ?? ''

  // выбор из списка
  if (props.params.hideClass.length && props.params.items.length)
    return props.params.items[props.params.checked].descr

  // показать placeholder
  if (props.selectPlaceholder) return props.selectPlaceholder

  return ''
}

function showCheck(props, index) {
  if (props.checkImg)
    return (
      <img class="custom-select-check" src={props.params.checked === index ? props.checkImg : ''} />
    )
  return ''
}

function showRightImg(props) {
  if (props.openImg && props.closeImg)
    return (
      <img
        src={props.params.hideClass.length ? props.openImg : props.closeImg}
        {...jsxAttr('class', '')}
        class="abs-y-center custom-select-img"
        onClick={props.openBy === 'img' ? emit(props.params.onListClick, {}, props.dest) : ''}
      />
    )
  return ''
}

function getItems(props, index) {
  return (
    <ul
      {...jsxAttr('class', `list-reset ${props.itemsClass ?? ''} ${props.params.hideClass ?? ''}`)}
    >
      {props.params.items.map((elem) => (
        <li
          {...jsxAttr(
            'class',
            `flex-row flex-justify-spb flex-align-center ${props.itemClass ?? ''}`
          )}
          key={elem.id}
          onClick={emit(props.params.onCheckItem, { key: elem.id }, props.dest)}
        >
          <span>{elem.descr}</span>
          {showCheck(props, index++)}
        </li>
      ))}
    </ul>
  )
}

export function renderCustomSelect(props) {
  let index = 0

  return (
    <div
      {...jsxAttr('class', `custom-select ${props.selectWrap ?? ''}`)}
      onClick={props.openBy === 'input' ? emit(props.params.onListClick, {}, props.dest) : ''}
    >
      {/* class="custom-select-input-wrap" */}
      <div>
        <input
          type="text"
          name="editor"
          {...jsxAttr('id', props.inputId ?? '')}
          {...jsxAttr('class', props.inputClass ?? '')}
          {...jsxAttr('value', selectValue(props))}
          {...jsxAttr('readonly', '', props.readOnly)}
          {...jsxAttr('placeholder', props.permanentPlaceHolder ?? '')}
          onInput={emit(props.onInputText, {}, props.dest)}
          // onChange={emit(props.onInputText, {}, props.dest)}
        />
        {showRightImg(props)}
      </div>
      {getItems(props, index)}
    </div>
  )
}
