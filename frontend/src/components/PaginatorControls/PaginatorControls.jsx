import { el } from 'redom'
import { emit, jsxAttr } from '../../js/shared'

import './PaginatorControls.css'

export function renderPaginatorControls(props) {
  return (
    <div class={`flex-row ${props.pagination}`}>
      <button
        class={`flat-btn pag-btn ${props.prevPaginBtn}`}
        onClick={emit('paginPrev', {src: props.src}, props.dest)}
        {...jsxAttr('disabled', 'true', props.prevPaginBtnDisabled)}
      >
        &#8678;
      </button>
      <button
        class={`flat-btn pag-btn ${props.nextPaginBtn}`}
        onClick={emit('paginNext', {src: props.src}, props.dest)}
        {...jsxAttr('disabled', 'true', props.nextPaginBtnDisabled)}
      >
        &#8680;
      </button>
    </div>
  )
}
