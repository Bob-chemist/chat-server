import Vue from 'vue'
import App from './App.vue'
/*import VueSocketIO from 'vue-socket.io'


Vue.use(VueSocketIO, 'http://localhost:3000'); // Automaticly socket connect from url string*/

new Vue({
    el: '#app',

    render: h => h(App)
})
