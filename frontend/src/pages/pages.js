import { AppPages } from '../types/AppPages.js'
import { LoginView } from '../views/LoginView/LoginView.js'
import { AccListView } from '../views/AccListView/AccListView.js'
import { AccDetailsView } from '../views/AccDetailsView/AccDetailsView.js'
import { AccSubDetailsView } from '../views/AccSubDetailsView/AccSubDetailsView.js'
import { CurView } from '../views/CurView/CurView.js'
import { AtmView } from '../views/AtmView/AtmView.js'
import { HeaderNavView } from '../views/HeaderNavView/HeaderNavView.js'
import { MessagesCenter } from '../components/MessagesCenter/MessagesCenter.js'

export function initPages(emitsCb) {
  const pages = new AppPages()

  pages.addView(
    'accListView',
    new AccListView('acc-list-view-id', 'app-view-id', 'accListView', {
      sortDir: 'asc' // "asc", "desc" },
    })
  )
  pages.addView(
    'accDetailsView',
    new AccDetailsView('acc-details-view-id', 'app-view-id', 'accDetailsView')
  )
  pages.addView(
    'accSubDetailsView',
    new AccSubDetailsView('acc-subdetails-view-id', 'app-view-id', 'accSubDetailsView')
  )
  pages.addView('curView', new CurView('cur-view-id', 'app-view-id', 'curView'))
  pages.addView('loginView', new LoginView('login-view-id', 'app-view-id', 'loginView'))
  pages.addView('atmView', new AtmView('atm-view-id', 'app-view-id', 'atmView'))

  pages.addView(
    'headerNavView',
    new HeaderNavView('header-nav-view-id', 'header-nav-id', 'headerNavView')
  )

  pages.addView('messageCenter', new MessagesCenter('msg-id', 'messages-id', 'messageCenter'), {
    noDelete: true
  })

  pages.getView('headerNavView').addNavItem('navBtn1', 'Банкоматы', async () =>
    pages.showView('atmView', '', {}, () => {
      pages.getView('atmView').mapShow()
    })
  )

  pages.getView('headerNavView').addNavItem('navBtn2', 'Счета', async () => {
    // список счетов нужно всегда обновлять
    pages.setRenderIt('accListView')
    pages.showView('accListView', 'reload')
  })

  pages.getView('headerNavView').addNavItem('navBtn3', 'Валюта', async () =>
    pages.showView('curView', '', {}, () => {
      pages.getView('curView').createMasks()
      pages.getView('curView').rateChangeShow()
    })
  )

  pages.getView('headerNavView').addNavItem('navBtn4', 'Выйти', async () => {
    pages.getView('loginView').logout()
    pages.getView('curView').closeWebSocket()
    pages.removeViews()
    pages.showView('loginView')
  })

  AppPages.catchClick(pages)
  AppPages.catchEmits(pages, emitsCb)

  return pages
}
