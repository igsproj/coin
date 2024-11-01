import { el } from 'redom'

import './MessagesCenter.css'
import { jsxAttr } from '../../js/shared'

export function renderMessageCenter(props) {
  return (
    <ul
      {...jsxAttr('id', props.id ?? '')}
      {...jsxAttr('class', `list-reset flex-column rg-5 ${props.class ?? ''}`)}
    ></ul>
  )
}
