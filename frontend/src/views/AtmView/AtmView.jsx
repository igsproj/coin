import { el } from 'redom'

import { renderYaMaps } from '../../components/YaMaps/YaMaps.jsx'
import './AtmView.css'

export function renderAtmView(props) {
  return (
    <section>
      <div class="flex-row flex-align-center page-header">
        <h1 class="nobr page-header-font">Карта банкоматов</h1>
      </div>
      {renderYaMaps(props)}
    </section>
  )
}
