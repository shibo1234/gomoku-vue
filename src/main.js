import { createApp } from 'vue'
import App from './App.vue'
import { IonicVue } from '@ionic/vue'
import '@ionic/vue/css/ionic.bundle.css';
import axios from 'axios';


const app = createApp(App)

axios.defaults.baseURL = 'http://35.247.101.233:5001';

app.config.globalProperties.$http = axios;
app.use(IonicVue)
app.mount('#app')