export function isValidStr(str) {
  return typeof str === 'string' && str.length > 0
}

export function isNumber(dig, fixed = false) {
  if (typeof dig != 'number') return false

  if (fixed && dig % 1 != 0) return false

  return true
}

export function isFunction(func) {
  return typeof func === 'function'
}

export function isError(res) {
  return res instanceof Error
}

export function runAsFunction(func, defFunc = () => {}) {
  return isFunction(func) ? func : defFunc
}

export function getClassName(obj) {
  return !obj.constructor ? undefined : obj.constructor.name
}

export function getAsType(val, asTypeStr) {
  if (asTypeStr === 'string') return String(val)

  if (asTypeStr === 'number') return Number(val)

  if (asTypeStr === 'date') return new Date(val)

  if (asTypeStr === 'boolean') return Boolean(val)
}

export function compareByType(val1, val2, toType) {
  return getAsType(val1, toType) === getAsType(val2, toType)
}

export function prepareString(value, strTrim, strCase) {
  if (!isValidStr(value)) return value

  let res = value
  if (strTrim) res = res.trim()

  if (strCase == 'lower') res = res.toLowerCase()

  if (strCase == 'upper') res = res.toUpperCase()

  return res
}

export function isValueInArr(val, arr, strTrim = true, strCase = 'lower') {
  for (let i = 0; i < arr.length; ++i)
    if (prepareString(arr[i], strTrim, strCase) === prepareString(val, strTrim, strCase))
      // Если значения строки, можно передать strTrim, strCase. Если не строки, то будут сравниваться значения без преобразований
      return i

  return -1
}

export function parseString(str, del, cb, cbArg, trim = true) {
  let pos = -1
  let start = 0

  function t(s, trim) {
    return trim === true ? s.trim() : s
  }

  while ((pos = str.indexOf(del, pos + 1)) != -1) {
    if (cb(t(str.slice(start, pos), trim), cbArg) === false) return false
    start = pos + 1
  }

  if (str.length > start) {
    pos = str.length
    if (cb(t(str.slice(start, pos), trim), cbArg) === false) return false
  }
  return true
}

export function parseString2(str, del, cb, cbArg, trim = true) {
  let pos = -1
  let start = 0

  function t(s, trim) {
    return trim === true ? s.trim() : s
  }

  let res
  while ((pos = str.indexOf(del, pos + 1)) != -1) {
    res = cb(t(str.slice(start, pos), trim), cbArg)
    if (res !== undefined) return res
    start = pos + 1
  }

  if (str.length > start) {
    pos = str.length
    res = cb(t(str.slice(start, pos), trim), cbArg)
    if (res !== undefined) return res
  }
  // return true;
}

/*
  использование :
  if (isEmptyObj(obj) !== false) // это пустой объект или вообще не объект
  if (isEmptyObj(obj) === false) // это точно объект и он не пустой
  параметр ignoreArray = true по умолчанию не рассматривает массив как объект. Если нужно проверять массив как объект то ignoreArray = false
*/
export function isEmptyObj(obj, ignoreArray = true) {
  if (!obj || typeof obj !== 'object' || (ignoreArray && Array.isArray(obj))) return // undefined

  // return !Object.keys(obj).length; // короче, но нет смысла
  for (let key in obj) // этот вариант должен быть быстрее, т.к не получает все ключи Object.keys
    return false

  return true
}

export function getObjChild(elem, path, returnOnNotFound) {
  if (isEmptyObj(elem) !== false)
    // пустой объект или не объект
    return returnOnNotFound

  let res = elem
  parseString(path, '.', (substr) => {
    // parseString by default trims 'substr'
    if (res[substr] === undefined) {
      res = returnOnNotFound
      return false
    }
    res = res[substr]
    return true
  })

  return res
}

export function setObjChild(obj, path, val) {
  let keys = path.split(".");
  for (let i = 0; i < keys.length; ++i) {
    let key = keys[i].trim();
    if (i === keys.length - 1)
      obj[key] = val;
    else
      obj = obj[key];
  }
}

export function updateObjFrom(src, dist, update = true, addNew = true) {
  const keys = Object.keys(dist)
  for (let key in src) {
    if (keys.includes(key)) {
      if (update) dist[key] = src[key]
    } else {
      if (addNew) dist[key] = src[key]
    }
  }
}

export function cloneObj(src) {
  return safeCall(() => {
    return JSON.parse(JSON.stringify(src))
  })
}

export function walkObj(rootObj, onObject, onNoneObject, maxDepth) {
  let fres
  for (let key in rootObj) {
    if (isEmptyObj(rootObj[key], false) === false) {
      // значение ключа это не пустой объект (или массив)
      fres = runAsFunction(onObject.func)(key, rootObj, onObject.param)
      if (fres !== undefined)
        // есть что вернуть - это прерывает погружение
        return fres

      // рекурсия на каждом объекте (массиве)
      fres = walkObj(rootObj[key], onObject, onNoneObject)
      if (fres !== undefined)
        // есть что вернуть - это прерывает погружение
        return fres
    } else {
      // значение ключа это не объект или пустой объект
      fres = runAsFunction(onNoneObject.func)(key, rootObj, onNoneObject.param)
      if (fres !== undefined) return fres
    }
  }
}

export function digObj(rootKey, obj, param, cb) {
  for (let curKey in obj[rootKey]) {
    // const val = obj[key][domKey];
    const fres = runAsFunction(cb)(curKey, rootKey, obj, param)
    if (fres !== undefined)
      // есть что вернуть - это прерывает погружение
      return fres
  }
}

export function getObjCopy(obj, deepClone) {
  if (deepClone === undefined) return obj

  if (isEmptyObj(obj) !== false) return obj

  if (deepClone === true) {
    const cloned = cloneObj(obj)
    return isError(cloned) ? obj : cloned
  }

  if (deepClone === false) return { ...obj }
}

/*
function filter(table, queryObj)

table - это массив из обектов

queryObj это объект из поисковых запросов вида:
  {
    "searchKey1": {"search": "что ищем", "type": "<string, number, boolean, date (или s,n,b,d)>", (доп для строк)
    searchKey1 может быть вида "key1.key2.key3" для поиска внутри объекта

    "mode":
    для строк:
    <=, !=, starts, ends, inc, search (regexp для String.search), "slice" (для String.slice())>
    Дополнительные параметры для строк:
    spos (начальная позиция для String.slice), epos (конечная позиция для String.slice)>,
    strTrim (делать String.trim() перед сравнением), strCase <"lower", "upper"> (приводить к регистру перед сравнением) },

    для чисел и дат mode: =, !=, >, >=, <, <=
    для boolean =, !=

    "searchKey2": {},
    "searchKey..N": {},
  }


  filter будет последовательно применять поисковые запросы. Т.е. результат одного фильтра будет исходными данными для следующего.
  Начальные данные - вся таблица
  Если получаем пустой фильтр, выходим и возвращаем [].

  значения будут строго сравниваться по типам. Тип должен быть задан в поле "type"
  для типа "string" можно задать как искать:
  "mode": <starts, ends, eq, inc> по началу, по окончанию, строгое равенство, включает подстроку
  strTrim - удаляем пробелы при поиске (как в запросе, так и в строке данных)
  strCase - <lower, upper> привести к типу перед сравнением (как в запросе, так и в строке данных)

  Возвращается последний фильтр.
*/

export function filter(table, queryObj) {
  const filters = []
  filters.push(table) // начальные данные - вся таблица

  for (let key in queryObj) {
    let query = queryObj[key] // см описание формата - это должен быть объект
    let filter = []

    if (isEmptyObj(query) === false)
      // это должен быть объект !
      filter = filters.at(-1).filter((elem) => {
        let res = false
        const type = isValidStr(query.type) ? query.type : 's' // если не задан тип, по умолчанию строка
        // "n", "s", "d", "b" - сокращения для типов
        if (!['number', 'string', 'date', 'boolean', 'n', 's', 'd', 'b'].includes(type))
          // тип должен быть установлен
          return

        if (['string', 's'].includes(type)) {
          const src = prepareString(String(getObjChild(elem, key)), query.strTrim, query.strCase)
          const search = prepareString(String(query.search), query.strTrim, query.strCase)

          if (query.mode === '=' || !isValidStr(query.mode))
            // по умолчанию если нет mode, сравниваем точно
            res = src === search

          if (query.mode === '!=') res = src !== search

          if (query.mode === 'starts') res = src.startsWith(search)

          if (query.mode === 'ends') res = src.endsWith(search)

          if (query.mode === 'inc') res = src.includes(search)

          if (query.mode === 'search')
            // regexp
            res = src.search(search) >= 0

          if (query.mode === 'slice') res = src.slice(query.spos, query.epos) === search
        }

        if (['date', 'd', 'number', 'n'].includes(type)) {
          let src, search
          if (['date', 'd'].includes(type)) {
            src = new Date(getObjChild(elem, key)).getTime() // msec
            search = new Date(query.search).getTime() // msec
          }

          if (['number', 'n'].includes(type)) {
            src = Number(getObjChild(elem, key))
            search = Number(query.search)
          }

          if (query.mode === '=' || !isValidStr(query.mode))
            // по умолчанию
            res = search === src

          if (query.mode === '!=') res = search !== src

          if (query.mode === '>') res = src > search

          if (query.mode === '>=') res = src >= search

          if (query.mode === '<') res = src < search

          if (query.mode === '<=') res = src <= search
        }

        if (['boolean', 'b'].includes(type)) {
          src = Boolean(getObjChild(elem, key))
          search = Boolean(query.search)

          if (query.mode === '=' || !isValidStr(query.mode))
            // по умолчанию
            res = search === src

          if (query.mode === '!=') res = search !== src
        }

        if (res) return elem
      })

    filters.push(filter)

    if (!filter.length)
      // дальше двигать нет смысла
      break
  }

  return filters.at(-1)
}

export function safeCall(func, ...params) {
  try {
    return runAsFunction(func)(...params)
  } catch (err) {
    if (isError(err)) return err

    return new Error(err)
  }
}

export async function safeCallAsync(func, ...params) {
  try {
    return await runAsFunction(func)(...params)
  } catch (err) {
    if (isError(err)) return err

    return new Error(err)
  }
}

//**********************************************************************/
export function setElemProps(elem, setObj, attrPostfix = '') {
  if (isValidStr(setObj.styleClass))
    // установка классов
    elem.classList = setObj.styleClass

  if (setObj.attrObj)
    for (let key in setObj.attrObj) {
      // установка аттрибутов
      let attr = getObjChild(setObj.attrObj, key + '._val')
      let postfix = getObjChild(setObj.attrObj, key + '._postfix')

      if (!postfix || postfix === 'auto') postfix = attrPostfix

      const resAttr = attr + postfix
      if (isValidStr(resAttr)) elem.setAttribute(key, resAttr)
    }

  if (setObj.valueField)
    for (let key in setObj.valueField) // установка значения напр (innerHtml, innerText, outerHtml, value, checked)
      elem[key] = getObjChild(setObj.valueField, key + '._val')
}

export function domCreateElem(appendTo, setObj, autoProps = true, attrPostfix = '') {
  if (!isValidStr(setObj.itemType)) return

  let elem = document.createElement(setObj.itemType)

  if (autoProps) setElemProps(elem, setObj, attrPostfix)

  if (isValidStr(setObj.appendFunc))
    // вызов функции создания
    appendTo[setObj.appendFunc](elem)
  else appendTo.append(elem) // по умолчанию

  return elem
}

export function checkFoundDom(elem, descr) {
  if (!elem) {
    alert('Ошибка запуска, загляните в консоль !')
    throw new Error('Не найден элемент : ' + descr)
  }
}

export function ifaceStateChange(mode, modesArr, cb) {
  let state1, state2
  if (mode === modesArr[0]) {
    state1 = 'add'
    state2 = 'remove'
  }
  if (mode === modesArr[1]) {
    state1 = 'remove'
    state2 = 'add'
  }
  if (modesArr.includes(mode)) cb(state1, state2)
}

export function addEventListenerOnce(elem, evName, cb) {
  if (!elem.eventsAdded) elem['eventsAdded'] = {}

  if (elem['eventsAdded'][evName]) {
    console.log(`${evName} уже установлено для '${elem.localName}'`)
    return
  }

  // console.log(elem);
  elem.addEventListener(evName, cb)
  elem['eventsAdded'][evName] = true
}

export function bindEvents(controlClass, evName, cb) {
  document.querySelectorAll(controlClass).forEach((elem) => addEventListenerOnce(elem, evName, cb))
}

export async function delay(msec) {
  return await new Promise((resolve, reject) => setTimeout(() => resolve(), msec))
}

function exchangeArrElems(arr, i1, i2) {
  let saved = arr[i1]
  arr[i1] = arr[i2]
  arr[i2] = saved
}

export function getRandomFromTo(val1, val2) {
  // для положительных чисел
  const min = Math.min(val1, val2)
  const max = Math.max(val1, val2)

  return min + Math.round(Math.random() * (max - min)) // 1 вариант с округлением
  // return min + Math.trunc(Math.random() * (max - min + 1)); // 2 вариант с trunc
}

export function mixArray(arr, onlyUniqIndex = true, changeToNewValue = true) {
  // TODO
  if (!Array.isArray(arr)) return new Error('Ожидается массив !')

  if (arr.length === 2) {
    exchangeArrElems(arr, 0, 1)
    return
  }

  for (let i = 0; i < arr.length; ++i) {
    let newIndex = getRandomFromTo(0, arr.length - 1) // Math.round(Math.random() * (arr.length - 1));

    // проверка на тот же индекс чтобы не переставлять с собой
    if (newIndex === i) {
      if (onlyUniqIndex)
        // ищем новый индекс
        do newIndex = getRandomFromTo(0, arr.length - 1)
        while (newIndex === i)
      else continue // нет смысла переставлять тот же элемент в любом случае
    }

    // значение такое же : либо искать новое, либо не переставлять
    if (arr[i] === arr[newIndex]) {
      if (changeToNewValue)
        // ищем новое значение
        do newIndex = getRandomFromTo(0, arr.length - 1)
        while (arr[i] === arr[newIndex])
      else continue // нет смысла менять одинаковые значения
    }

    exchangeArrElems(arr, i, newIndex)
  }
}

// function arrIncludes(arr1, arr2) {
//   for (let i = 0; i < arr1.length; ++i)
//     if (arr2.find(item => item === arr1[i]))
//       return true;
// }

export function isCyrPattern(str) {
  const cyrillicPattern = /^[\u0400-\u04FF]+$/
  const res = cyrillicPattern.test(str)
  // console.log(res);
  return res
}

export function validateEmail(email) {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regex.test(String(email).toLowerCase())
}

export function checkPhone(phone) {
  const regex = /^[+][0-9]{1,3}[\s][(]{1}[0-9]{3}[)]{1}[\s]{1}[0-9]{3}[-]{1}[0-9]{2}[-]{1}[0-9]{2}$/ // +xxx (xxx) xxx-xx-xx
  return regex.test(phone)
}

export function isValidUrl(string) {
  try {
    const newUrl = new URL(string)
    return newUrl //.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return err
  }
}

export function makeRussianName(str, minLength = 3) {
  const res = str.trim()
  if (minLength > 0 && !isValidStr(res))
    return new Error('параметр должен быть строкой и не быть пустым !')

  if (res.length > 0 && !isCyrPattern(res)) return new Error('ожидаем русские буквы')

  if (res.length < minLength) return new Error(`ожидаем длину не меньше ${minLength}-х символов`)

  if (res.length > 0) return res[0].toUpperCase() + res.substr(1).toLowerCase()

  return ''
}

export function strOf(strToCheck, elemsStr) {
  if (!isValidStr(strToCheck) || !isValidStr(elemsStr)) return

  for (let i = 0; i < elemsStr.length; ++i) if (strToCheck.includes(elemsStr[i])) return true

  return false
}

export function checkSpecialStr(srcStr, minLength, mustHaveStr, forbStr) {
  if (!isValidStr(srcStr)) return new Error('параметр должен быть строкой и не быть пустым !')

  if (typeof minLength != 'number') return new Error('минимальная длина должна быть числом !')

  if (strOf(srcStr, mustHaveStr) === false)
    return new Error('строка не содержит обязательные символы')

  if (strOf(srcStr, forbStr) === true) return new Error('строка содержит запрещенные символы')

  if (isCyrPattern(srcStr)) return new Error('строка содержит русские символы')

  if (srcStr.length < minLength) return new Error(`ожидаем длину не меньше ${minLength}-х символов`)

  return true
}

export function checkNumberInterval(val, min, max) {
  if (val < min || val > max) return new Error(`ожидаем число от ${min} до ${max}`)

  return true
}

export function russianAgeFormat(age) {
  const ageStr = String(age)
  const ends = Number(ageStr[ageStr.length - 1])

  let ageRus = 'лет'

  if (age >= 10 && age <= 20) return ageRus

  if (ends === 1) ageRus = 'год'
  if (ends > 1 && ends <= 4) ageRus = 'года'
  if (ends > 4) ageRus = 'лет'

  return ageRus
}

export function dateToRussian(date) {
  function addZero(date) {
    return (date = date < 10 ? '0' + date : date)
  }

  return addZero(date.getDate()) + '.' + addZero(date.getMonth() + 1) + '.' + date.getFullYear()
}

export function checkInputDate(dt, startDate, maxDate) {
  const minDate = new Date(startDate).getFullYear()
  const checkDate = new Date(dt).getFullYear()

  maxDate = !maxDate ? new Date().getFullYear() : new Date(maxDate).getFullYear()

  if (isNaN(checkDate) && isNaN(minDate)) return false

  if (checkDate < minDate || checkDate > maxDate) return false

  return dt
}

export function getDateInMonth(date) {
  const calcDate = date ? new Date(date) : new Date()
  if (isNaN(calcDate)) return 0

  return calcDate.getFullYear() * 12 + calcDate.getMonth()
}

export function calcAge(birthDate) {
  const age = (getDateInMonth() - getDateInMonth(birthDate)) / 12
  return { years: Math.trunc(age), months: Math.trunc((age % 1) * 12) }
}

export function validateFormField(template, key, value) {
  // проверка типа по шаблону
  if (!template[key])
    // key (или key value) не найден в шаблоне
    return null

  if (typeof template[key].type !== typeof value) return false

  return true // ok
}

export function validateEntry(pair, prevEntry, template, okCallBack) {
  const getType = validateFormField(template, pair[0], pair[1])
  if (getType === null)
    // нет такого ключа в шаблоне, не проверяем
    return

  const fieldDescr = template[pair[0]].rusDescr ? template[pair[0]].rusDescr : pair[0]
  if (getType === false)
    // ключ есть, но тип не соответствует
    return new Error(fieldDescr + ' : проверьте тип!')

  const fname = template[pair[0]].func
  const func = isFunction(fname) ? fname : window[fname]

  let getValue = func({ str: pair[1], field: pair[0], descr: fieldDescr, prevEntry }) // проверка если есть специальная функция для поля
  if (isError(getValue)) return getValue

  runAsFunction(okCallBack)(pair[0], pair[1], getValue)
}

export function processForm(form, template, mainCallBack, okCallBack, useEntries = true) {
  // первый вариант - использовать FormData
  if (useEntries) {
    const entries = new FormData(form).entries()
    let prevEntry = null
    for (const pair of entries) {
      // console.log(pair);
      const res = runAsFunction(mainCallBack)(pair, prevEntry, template, okCallBack)
      if (isError(res)) return res

      prevEntry = pair
    }
    return
  }
  // второй вариант - использовать реквизиты формы напрямую
  // console.log(form[0]);
}

export function validateForm(form, template, okCallBack, useEntries = true) {
  return processForm(form, template, validateEntry, okCallBack, useEntries)
}

export function fillForm(formObj, formName, appLocalSet) {
  // загрузка данных в форму из appLocalSet. в appLocalSet у формы должен быть объект с именем formName
  if (!appLocalSet[formName]) return

  for (let i = 0; i < formObj.length; ++i) {
    const name = formObj[i].getAttribute('name')
    const val = formObj[i].getAttribute('value')

    if (['checkbox', 'radio'].includes(formObj[i].type))
      if (appLocalSet[formName][name]) {
        // checked
        // есть настройка - значит checked
        if (appLocalSet[formName][name] === val || appLocalSet[formName][name] === 'on')
          formObj[i].checked = true
      } else formObj[i].checked = false

    if (['number', 'text'].includes(formObj[i].type))
      if (appLocalSet[formName][name])
        // value
        formObj[i].value = appLocalSet[formName][name]
  }
}

export function saveAppSettings(id, dataCb) {
  const save = runAsFunction(dataCb)()
  localStorage.setItem(id, JSON.stringify(save))
}

export function readAppSettings(id) {
  let res = localStorage.getItem(id)
  return !res ? {} : JSON.parse(res)
}

export function initStorage(id, dataCb) {
  let stor = readAppSettings(id)
  if (isEmptyObj(stor)) {
    // сохранить начальные настройки по умолчанию при первом запуске
    // console.log("initStorage");
    saveAppSettings(id, dataCb)
    stor = readAppSettings(id)
  }
  return stor
}

export function createIdInt(str) {
  // число
  let id = 0
  for (let i = 0; i < str.length; ++i) id = id + Number(str.charCodeAt(i)) //.toString(16));

  return id
}

// Длинная Hex строка
export function createIdHexStr(str) {
  let id = ''
  for (let i = 0; i < str.length; ++i) id = id + String(str.charCodeAt(i).toString(16))

  return id
}

export function createUniqId() {
  return Math.floor(Math.random() * Date.now())
}

export function autoDomId() {
  return 'id-' + String(createUniqId())
}

export function domCachedStor() {
  const domStore = {}

  return function (selector, onNotFound, removeSelector) {
    let domEl = null

    if (selector in domStore) {
      if (removeSelector) {
        delete domStore[selector]
        return domEl
      }

      domEl = domStore[selector]

      // ссылка есть, но элемент удален из Dom
      if (domEl.parentNode === null)
        domEl = null
    }

    if (!domEl) {
      domEl = document.querySelector(selector)

      if (!domEl)
        return runAsFunction(onNotFound, () => null)(domStore)

      domStore[selector] = domEl
    }

    return domEl
  }
}

class NetworkError extends Error {}

export async function loadData(url, fetchFunc = 'json', onErrorCb, fetchParams) {
  let resp
  try {
    resp = await fetch(url, fetchParams)

    if (!resp.ok) {
      const err = new NetworkError('Ответ сервера')
      err.resp = resp
      throw err
    }

    return await resp[fetchFunc]()
  } catch (err) {
    if (!resp) {
      // исключения в fetch когда нет сети
      err.resp = {}
      err.resp.url = url
      err.resp.status = 0
      err.resp.statusText = 'Нет сети'
    }

    runAsFunction(onErrorCb)(err)
    return err
  }
}
