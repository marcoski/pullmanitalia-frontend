import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from '../../node_modules/vuex/dist/logger';
import LoaderPlugin from './plugins/loader';

import loader from './modules/loader';
import config from './modules/config';
import suppliers from "./modules/suppliers";
import customers from "./modules/customers";
import pullmans from "./modules/pullmans";
import bookings from "./modules/bookings";
import routes from "./modules/routes";
import rentals from "./modules/rentals";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        loader,
        config,
        customers,
        suppliers,
        pullmans,
        bookings,
        routes,
        rentals
    },
    strict: debug,
    plugins: debug ? [createLogger(), LoaderPlugin] : [LoaderPlugin]
});