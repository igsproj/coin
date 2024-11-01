import { runAsFunction, isError, isValidStr, domCreateElem, getObjChild } from '../../js/lib.js'
import { messageFadeIn, messageAlive } from '../../js/init.js'
import { AppView } from '../../types/AppView.js'

import { renderMessageCenter } from './MessagesCenter.jsx'

export class MessagesCenter extends AppView {
  showMessage(data, className, customMsgCb) {
    // data - это строка или Error
    let msg = ''

    if (isValidStr(data)) msg = data

    if (isError(data)) {
      msg = data.message

      if (data.resp) msg += ` ${data.resp.url} ${data.resp.status} ${data.resp.statusText}`

      const customMsg = runAsFunction(customMsgCb)(data)

      if (isValidStr(customMsg)) msg = customMsg

      if (customMsg === null) return
    }

    const root = this.getDomElem('#msg-ul-id')

    const item = domCreateElem(root, {
      itemType: 'li',
      styleClass: 'messages-item fade-in ' + className,
      valueField: { innerText: { _val: msg } }
    })

    setTimeout(() => {
      item.classList.add('fade-out')
      setTimeout(() => {
        item.remove()
      }, messageFadeIn)
    }, messageAlive)
  }

  errorMessage(err, errorsList) {
    const errType = err.constructor.name

    if (errType === 'NetworkError') {
      if (!err.resp.status)
        // тк использую abort(), не попадаем сюда, соединение сразу закрывается после потери сети
        return 'Произошла ошибка, проверьте подключение к интернету'

      return getObjChild(errorsList, err.resp.status + '.msg')
    }

    if (errType === 'TypeError') {
    }

    if (errType === 'SyntaxError') {
      // bad JSON
      return 'Произошла ошибка, попробуйте обновить страницу позже'
    }

    return ''
  }

  async getViewDom(mode, srcData) {
    this.newProps = Object.assign({}, srcData)
    this.newProps.id = 'msg-ul-id'
    this.newProps.class = 'dlg-label-font'

    return renderMessageCenter(this.newProps)
  }
}
