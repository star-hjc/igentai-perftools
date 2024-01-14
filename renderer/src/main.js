import { createApp } from 'vue'

import App from './App.vue'
import store from './store'
import router from './router'
import components from './components'
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import './style.css'
import 'xterm/css/xterm.css'
const app = createApp(App)

app.use(components)
app.use(ArcoVueIcon)
app.use(router)
/** 状态管理器 - Pinia */
app.use(store)



app.mount('#app')