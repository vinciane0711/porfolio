import './assets/main.scss'
import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

function addGtag() {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${
    import.meta.env.VITE_GTAG
  }`
  document.head.appendChild(script)
  script.onload = () => {
    window.dataLayer = window.dataLayer || []
    function gtag(str: string, param: any) {
      window.dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', import.meta.env.VITE_GTAG)
  }
}

if (!import.meta.env.DEV) addGtag()

const app = createApp(App)
app.use(router)
app.mount('#app')
