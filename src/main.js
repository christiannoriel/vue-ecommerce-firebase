import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { fb } from './firebase';
import VueFirestore from 'vue-firestore';
require('firebase/firestore');

Vue.use(VueFirestore, {
  key: 'id',
  enumerable: true
});

Vue.use(VueFirestore);

import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import 'popper.js';
import 'bootstrap';
import './assets/app.scss';

import Swal from 'sweetalert2';
window.Swal = Swal;

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000
});

window.Toast = Toast;

Vue.component('NavBar', require('./components/NavBar.vue').default);

Vue.config.productionTip = false;

let app = '';
fb.auth().onAuthStateChanged(function (user) {

  if (!app) {
    new Vue({
      router,
      render: h => h(App)
    }).$mount("#app");
  }

})
