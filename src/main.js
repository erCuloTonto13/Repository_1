import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
const app = createApp(App)

app.use(router)

app.mount('#app')



window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    // authEndpoint DEBE apuntar a la URL completa de tu backend Laravel
    // y al puerto correcto (asumiendo 8000 para el backend)
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
    auth: {
        headers: {
            // Asegúrate de que 'token' sea la clave correcta en sessionStorage
            // donde guardas el token JWT.
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            Accept: 'application/json', // Es buena práctica añadir Accept header
        },
    },
});

// Opcional: Hacer Pusher global si algún otro script lo necesita directamente,
// pero Echo ya lo encapsula.
// window.Pusher = Pusher;
