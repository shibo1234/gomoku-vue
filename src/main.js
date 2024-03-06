import { createApp } from 'vue'
import App from './App.vue'
import { IonicVue } from '@ionic/vue'
import '@ionic/vue/css/ionic.bundle.css';
import axios from 'axios';


const app = createApp(App)

axios.defaults.baseURL = 'http://127.0.0.1:5001';

app.config.globalProperties.$http = axios;
app.use(IonicVue)
app.mount('#app')