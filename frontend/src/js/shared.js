import { loadData, runAsFunction } from '../js/lib.js'

/******************************************************************
emits
******************************************************************/

function execCmd(cmd, mode) {
  if (mode === 'jsx') return cmd
  if (mode === 'exec') new Function(cmd)()
}

export function sendEvToWindow(mode, evName, emit, data, dest, dataStringify = true) {
  const cmd = `window.dispatchEvent(new CustomEvent('${evName}', { detail: { emit: '${emit}', data: '${dataStringify && data ? JSON.stringify(data) : data}', dest: '${dest}' } }))`
  return execCmd(cmd, mode)
}

export function sendEvToNode(evName, emit, data, dest, dataStringify = true) {
  dest.dispatchEvent(
    new CustomEvent(evName, {
      detail: { emit: emit, data: dataStringify && data ? JSON.stringify(data) : data }
    })
  )
}

export function sendEmitToWindow(mode, emit, data, dest, dataStringify = true) {
  return sendEvToWindow(mode, 'emit', emit, data, dest, dataStringify)
}

export function emit(emit, data, dest) {
  return sendEvToWindow('jsx', 'emit', emit, data, dest, true)
}

/******************************************************************
api
******************************************************************/

export function getServerError(httpRes) {
  const code = httpRes.resp ? httpRes.resp.status : ''
  return `Сервер : ${httpRes.message} ${code > 0 ? 'server code : ' + code : ''}`
}

export async function callApi(path, params) {
  const auth = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + sessionStorage.getItem('token')
    }
  }

  const resp = await loadData(
    sessionStorage.getItem('apiRoot') + path,
    'json',
    null,
    Object.assign(auth, params)
  )

  if (resp instanceof Error) return resp
  if (!resp.payload) return new Error(resp.error)

  return resp
}

export async function api(path, params, onSuccessCb) {
  const httpRes = await callApi(path, params)

  if (httpRes instanceof Error) {
    sendEmitToWindow('exec', 'message', {
      msg: getServerError(httpRes),
      level: 'message-error-critical'
    })
    return false
  }

  return await runAsFunction(onSuccessCb, () => true)(httpRes)
}

/******************************************************************
format
******************************************************************/

export function makeStrOf(smb, amount) {
  let res = ''
  for (let i = 0; i < amount; ++i) res += smb
  return res
}

export function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

export function formatDate(dateStr, formatStr) {
  const date = new Date(dateStr)

  return isValidDate(date) ? date.toLocaleString('ru-Ru', formatStr) : ''
}

export function showAmount(sum) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(sum)
}

export function showNumber(num) {
  return new Intl.NumberFormat('ru-RU').format(num)
}

export function formatAmount(sum, plus) {
  const amount = showAmount(sum)
  return plus ? `+ ${amount}` : `- ${amount}`
}

// parseFloat странно работает! это замена для парсинга чисел (например после использования над ними Intl). Удаляем все лишнее : кроме чисел и разделителя дробной части
export function UnIntlNumber(numAsStr) {
  // возвращаем строку ! Далее можно преобразовать в Number или BigInt
  let resStr = []
  const dig = []
  let foundDot = false

  for (let i = 0; i <= 9; ++i) dig.push(String(i))

  for (let i = numAsStr.length - 1; i >= 0; --i) {
    // При интернализации разделитель целой и дробной части может быть "." или "," кроме того в таком числе возможны и другие символы. Получаем дробную часть в формате JS (".")
    if (['.', ','].includes(numAsStr[i]) && !foundDot) {
      resStr.unshift('.') // JS понимает '.' для разделителя дробей
      foundDot = true
      continue
    }

    if (dig.includes(numAsStr[i])) resStr.unshift(numAsStr[i])
  }

  return resStr.join('')
}

/******************************************************************
render
******************************************************************/

export async function renderPagePart(renderFuncOrHtml, domElem, mode = 'children') {
  // mode = 'children', 'elem'
  const domNodes = await runAsFunction(renderFuncOrHtml, () => renderFuncOrHtml)()

  if (!domNodes || !domElem) {
    console.error(
      `renderPagePart: ${!domNodes ? 'nothing to render - no html' : 'no root element'}`
    )
    return false
  }

  if (!['children', 'elem'].includes(mode)) {
    console.error(`renderPagePart: unknown mode '${mode}'`)
    return false
  }

  if (mode === 'elem') domElem.replaceWith(domNodes)
  if (mode === 'children') domElem.replaceChildren(domNodes)

  return true
}

export function jsxAttr(name, value, add = true) {
  const obj = {}
  obj[name] = value

  return add ? obj : {}
}

export function clearChildNodes(domEl) {
  while (domEl.children.length > 0) domEl.children[0].remove()
}
