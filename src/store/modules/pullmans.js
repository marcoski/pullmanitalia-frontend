import _ from 'lodash';
import Pullmans from "../../data/_pullmans";

export default {
    state: {
        pullmans: {
            items: [],
            count: 0
        },
    },

    getters: {
        allPullmans: function(state){
            const pullmans = _.cloneDeep(state.pullmans);
            return pullmans.items;
        },

        countPullmans: function(state){
            return state.pullmans.count;
        },

        getPullmanById: function(state){
            return function(id){
                const pullmans = _.cloneDeep(state.pullmans);
                return pullmans.items.find(item => item.id == id);
            }
        },
    },

    mutations: {
        loadPullmans: function(state, p){
            state.pullmans.items = p.items;
            state.pullmans.count = p.count;
        },

        deletePullmans: function(state, pullmans){
            _.remove(state.pullmans.items, p => pullmans.includes(p.id));
            state.pullmans.count = state.pullmans.items.length;
        },

        updatePullman: function(state, pullman){
            let p = state.pullmans.items.findIndex(item => item.id == pullman.id);
            if(p !== undefined){
                state.pullmans.items[p] = _.cloneDeep(pullman);
            }
        },

        addPullman: function(state, pullman){
            pullman.id = state.pullmans.count;
            state.pullmans.count++;
            state.pullmans.items.push(pullman);
        }
    },

    actions: {
        loadPullmans: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    /** Filters all pullmans by supplier id */
                    const pullmans = {};
                    pullmans.items = Pullmans.items.filter(pullman => pullman.supplier == payload.data);
                    pullmans.count = Pullmans.count = pullmans.items.length;
                    context.commit('loadPullmans', pullmans);
                    resolve();
                }, 1000);
            });
        },

        deletePullmans: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('deletePullmans', payload.data);
                    resolve();
                }, 1000);
            });
        },

        updatePullman: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('updatePullman', payload.data);
                    resolve();
                }, 1000)
            });
        },

        addPullman: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('addPullman', payload.data);
                    resolve();
                }, 1000);
            });
        }
    }
}