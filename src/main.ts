import 'vuetify/styles'
import './assets/main.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import App from './App.vue'
import router from './router'

const vuetify = createVuetify()

createApp(App).use(router).use(vuetify).mount('#app')
