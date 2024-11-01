import { api, sendEmitToWindow } from '../../js/shared.js'
import { eventBeginDelay } from '../../js/init.js'

const { AppView } = await import('../../types/AppView.js')
const { renderAtmView } = await import('./AtmView.jsx')

export class AtmView extends AppView {
  mapPoints = []
  mapsReady = false

  async getMapsPoints() {
    return await api('/banks', { method: 'GET' }, async (httpRes) => {
      this.mapPoints = httpRes.payload
      return this.mapPoints
    })
  }

  mapInit(id) {
    let atmMap = new ymaps.Map(id, {
      center: [55.751216, 37.623193], //координаты центра
      zoom: 10 //уровень приближения
    })

    this.mapPoints.forEach((elem) => {
      atmMap.geoObjects.add(
        new ymaps.Placemark(
          [elem.lat, elem.lon],
          {
            iconContent: '', //текст на иконке
            balloonContent: 'Coin Банкомат 24h' /*текст появляющийся после нажатия*/
          },
          {
            preset: 'twirl#blueStretchyIcon' //тип иконки
          }
        )
      )
    })
  }

  mapShow() {
    ymaps.ready(async () => {
      this.mapInit(this.newProps.id)
      this.mapsReady = true
      sendEmitToWindow('exec', 'mapsLoadEnd')
    })
  }

  /*****************************************
  API
  *****************************************/

  async getViewDom(mode, srcData) {
    if (!this.mapsReady && !window.ymaps) {
      sendEmitToWindow('exec', 'message', {
        msg: 'Не загружено yandex maps api. Проверьте сеть и обновите страницу',
        level: 'message-error-critical'
      })
      return false
    }

    if (!this.mapsReady) {
      setTimeout(() => {
        if (!this.mapsReady) sendEmitToWindow('exec', 'mapsLoadBegin')
      }, eventBeginDelay)

      if (!(await this.getMapsPoints())) { // ошибка при получении точек
        sendEmitToWindow('exec', 'message', {
          msg: 'Ошибка получения банкоматов. Проверьте сеть и обновите страницу',
          level: 'message-error-critical'
        })

        sendEmitToWindow('exec', 'mapsLoadEnd')
        return false
      }
    }

    this.newProps = Object.assign({}, srcData)
    this.newProps.id = 'ya-maps-id'

    return renderAtmView(this.newProps)
  }
}
