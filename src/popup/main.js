import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/plugins/bootstrap-vue'
import '@/css/custom.scss'
import '@/css/themes.scss'
import '@/css/scrollbar.css'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
