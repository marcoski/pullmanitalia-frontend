import _ from 'lodash';
import Routes from "../../data/_routes";
import EventsManager from '../../classes/EventsManager';

export default {
    state: {
        routes: {
            items: [],
            count: 0
        },
    },

    getters: {
        allRoutes: function(state){
            const routes = _.cloneDeep(state.routes);
            return routes.items;
        },

        countRoutes: function(state){
            return state.routes.count;
        },

        getRouteById: function(state){
            return function(id){
                const routes = _.cloneDeep(state.routes);
                return routes.items.find(item => item.id == id);
            }
        },

        getRoutesByPullman: function(state){
            return function(pullman){
                const routed = _.cloneDeep(state.routes);
                return routes.items.filter(item => item.pullman.id == pullman);
            }
        }
    },

    mutations: {
        loadRoutes: function(state, r){
            state.routes.items = r.items;
            state.routes.count = r.count;
        },

        deleteRoutes: function(state, routes){
            _.remove(state.routes.items, r => routes.includes(r.id));
            state.routes.count = state.routes.items.length;
        },

        updateRoute: function(state, route){
            let r = state.routes.items.findIndex(item => item.id == route.id);
            if(r !== undefined){
                state.routes.items[r] = _.cloneDeep(route);
            }
        },

        addRoute: function(state, route){
            route.id = state.routes.count;
            state.routes.count++;
            state.routes.items.push(route);
        }
    },

    actions: {
        loadRoutes: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    let routes = Routes.items.filter(route => route.pullman.supplier == payload.data.id);
                    const evManager = new EventsManager(routes, payload.data.date);
                    evManager.generateCalendarEvents();
                    context.commit('loadRoutes', {
                        items: evManager.calendarEvents,
                        count: evManager.calendarEvents.length
                    });
                    resolve();
                }, 1000);
            });
        },

        deleteRoutes: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('deleteRoutes', payload.data);
                    resolve();
                }, 1000);
            });
        },

        updateRoute: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('updateRoute', payload.data);
                    resolve();
                }, 1000)
            });
        },

        addRoute: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('addRoute', payload.data);
                    resolve();
                }, 1000);
            });
        }
    }
}