import "./assets/reset.css";
import "./assets/global.scss";
import "uno.css";


import { createApp } from 'vue'

import App from './App.vue'

import { setupRouter } from './router'
import { setupStore } from "./stores";
import { setupInit } from "./utils";


async function init() {
    const app = createApp(App)

    setupStore(app)
    await setupRouter(app)
    setupInit(app)
    app.mount('#app')
}

init()
