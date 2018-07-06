import Vue from 'vue'
import App from './app/App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlay, faStop, faPlayCircle, faStopCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import './index.scss'

library.add(faPlay)
library.add(faPlayCircle)
library.add(faStop)
library.add(faStopCircle)
Vue.component('font-awesome-icon', FontAwesomeIcon)

export default new Vue({
  el: '#app',
  render: h => h(App)
})
