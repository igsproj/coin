export const appId = 'coin' // id приложения для localStorage

// charts
export const useMockChartData = true // сервер отдает по основному счету данные за текущий месяц этого года (+ пред. годы). в режиме mockChartData = true формирутся случайные данные за год (или более) зависит от useThisYearData
export const useThisYearData = false // считаем данные только за текущий год (иначе за все время)

export const excludedAccounts = ['74213041477477406320783754'] // счета на которые не действует mocking
export const shortMonthInChart = true // 3 буквы в месяце в графиках : как в figma
export const shortYearInChart = true // 2 цифры года для режима useThisYearData = false

//real time rates
export const realTimeRatesDelay = 5000 // Сервер отдает данные каждую секунду. Чтобы его немного тормознуть и показывать в своем ритме - можно использовать это
export const realTimeRatesMaxRec = 12  // сколько записей максимум храним и показываем (По макету 12)

//
export const userCurPaginationRec = 6 // шаг пагинации для валют. (0 для отключения пагинации)

//transactions
export const transSubDetailsPaginationRec = 25 // шаг пагинации для счетов. в ТЗ - 25. (0 для отключения пагинации)
export const maxLastTransactions = 10 // для показа истории в карточке счета : в ТЗ - последние 10 транзакций без пагинации
export const ratioMinOrMax = 'max'   // min - max . при min будет искаться минимальное соотношение транзакций, при max - максимальное. на графике будет показана разность этих сумм

// custom select
export const selectItemClass = 'custom-select-item custom-select-font'
export const selectItemsClass = 'custom-select-items'
export const selectInputClass = 'custom-select-input custom-select-font'

// messages
export const messageAlive = 2000;
export const messageFadeIn = 1000;

// spinner
export const eventBeginDelay = 200
export const eventEndDelay = 600
export const appLoadDelay = 1500

//debug
export const logAttrUpdate = false
export const showChartData = false
