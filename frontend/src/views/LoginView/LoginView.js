import { api, sendEmitToWindow } from '../../js/shared.js'
import { eventBeginDelay } from '../../js/init.js'

const { AppView } = await import('../../types/AppView.js')
const { renderLoginView } = await import('./LoginView.jsx')

export class LoginView extends AppView {
  getLoginData() {
    const form = document.forms['login-form']

    if (!form) return false

    return {
      login: form.login.value,
      password: form.password.value
    }
  }

  resetLoginData() {
    const form = document.forms['login-form']

    if (form) {
      form.login.value = ''
      form.password.value = ''
    }
  }

  async login() {
    const body = this.getLoginData()

    if (!body) {
      sendEmitToWindow('exec', 'message', {
        msg: 'не передан логин / пароль',
        level: 'message-info'
      })
      return false
    }

    let httpRes = null,
      eventBegin = false

    setTimeout(() => {
      if (httpRes === null) {
        sendEmitToWindow('exec', 'loginBegin')
        eventBegin = true
      }
    }, eventBeginDelay)

    httpRes = await api(
      '/login',
      {
        body: JSON.stringify(body),
        method: 'POST'
      },
      async (httpRes) => {
        sessionStorage.setItem('login', body.login)
        sessionStorage.setItem('token', httpRes.payload.token)
        this.resetLoginData()

        return true
      }
    )

    if (eventBegin)
      sendEmitToWindow('exec', 'loginEnd')

    return httpRes
  }

  logout() {
    sessionStorage.setItem('login', '')
    sessionStorage.setItem('token', '')
  }

  async getViewDom(mode, srcData) {
    this.newProps = Object.assign({}, srcData)
    this.newProps.emit = 'loginBtnClick'

    return renderLoginView(this.newProps)
  }

  async viewActions(ev) {
    if (ev.detail.emit === '') {
    }
  }
}
