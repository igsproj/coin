import { el } from 'redom'
import { emit } from '../../js/shared'

import './LoginForm.css'

export function renderLoginForm(props) {
  return (
    <form class="flex-row abs-xy-center cg-18 login-dlg" name="login-form">
      <div class="flex-column flex-justify-spb login-dlg-left">
        <span class="dlg-label-font login-dlg-label">Логин</span>
        <span class="dlg-label-font login-dlg-label">Пароль</span>
      </div>

      <div class="flex-column">
        <span class="login-dlg-header page-header-font">Вход в аккаунт</span>

        <div class="flex-column rg-25 pdb-30">
          <input
            type="text"
            name="login"
            class="login-dlg-name login-dlg-input dlg-input-font"
            placeholder='Введите логин'
          />
          <input
            type="password"
            name="password"
            class="login-dlg-pass login-dlg-input dlg-input-font"
            placeholder='Введите пароль'
          />
        </div>
        <button class="flat-btn shared-btn btn-font login-dlg-btn" type="button" onClick={emit(props.emit)}>
          Войти
        </button>
      </div>
    </form>
  )
}
