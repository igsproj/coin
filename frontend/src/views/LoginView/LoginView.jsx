import { el } from 'redom'
import { renderLoginForm } from '../../components/LoginForm/LoginForm.jsx'

// import { sendEmitToWindow } from '../../js/shared'

import './LoginView.css'

export function renderLoginView(props) {
  return <section>{renderLoginForm(props)}</section>
}
