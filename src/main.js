import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Application from './Application'
import store from './store';
import lodash from 'lodash';
import moment from 'moment';
import Configs from './data/_configs';
import VueGoogleMapsPlugin from './plugin/vue-google-maps';
import VueResizeObserver from './plugin/vue-resize-observer';


Object.defineProperty(Vue.prototype, '$lodash', {value: lodash});
Object.defineProperty(Vue.prototype, '$moment', {value: moment});
Object.defineProperty(Vue.prototype, '$app', {
    value: {
        configs: Configs
    }
});

Object.defineProperty(Vue.prototype, '$radio', {value: new Vue()} );

Vue.use(BootstrapVue);
Vue.use(VueResizeObserver);
Vue.use(VueGoogleMapsPlugin, {
    load: {
        apiKey: 'AIzaSyCeIV2gmisWRMFTyHqVM8h00FrtoMKBSr0', /** Pullman italia API KEY for GoogleMaps */
        libraries: ['places']
    }
});
new Vue({
    el: '#pullmanitalia-app',
    store,
    template: '<Application />',
    components: { Application },
});