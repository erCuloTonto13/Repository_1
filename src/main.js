import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importa la instancia de Echo desde tu archivo de configuración dedicado
import echoInstance from './echo'; // Asegúrate de que la ruta sea correcta si tu echo.js no está directamente en src/

const app = createApp(App)

app.use(router)

app.mount('#app')

// Asigna la instancia de Echo importada a window.Echo
// Esto hace que `window.Echo` esté disponible globalmente para todos tus componentes
window.Echo = echoInstance;
