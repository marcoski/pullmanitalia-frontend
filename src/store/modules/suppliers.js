import Suppliers from "../../data/_suppliers";
import _ from 'lodash';

export default {
    state: {
        suppliers: {
            items: [],
            count: 0
        },
    },

    getters: {
        allSuppliers: function(state){
            const suppliers = _.cloneDeep(state.suppliers);
            return suppliers.items;
        },

        getSupplierById: function(state){
            return function(id){
                const suppliers = _.cloneDeep(state.suppliers.items);
                return suppliers.items.find(item => item.id == id);
            }
        },

        countSuppliers: function(state){
            return state.suppliers.count;
        }
    },

    mutations: {
        loadSuppliers: function(state, s){
            state.suppliers.items = s.items;
            state.suppliers.count = s.count;
        },

        deleteSuppliers: function(state, suppliers){
            _.remove(state.suppliers.items, s => suppliers.includes(s.id));
            state.suppliers.count = state.suppliers.items.length;
        },

        updateSupplier: function(state, supplier){
            let s = state.suppliers.items.findIndex(item => item.id == supplier.id);
            if(s !== undefined){
                state.suppliers.items[s] = _.cloneDeep(supplier);
            }
        },

        addSupplier: function(state, supplier){
            supplier.id = state.suppliers.count;
            state.suppliers.count++;
            state.suppliers.items.push(supplier);
        }
    },

    actions: {
        loadSuppliers: function(context){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('loadSuppliers', Suppliers);
                    resolve();
                }, 1000);
            });
        },

        deleteSuppliers: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('deleteSuppliers', payload.data);
                    resolve();
                }, 1000);
            });
        },

        updateSupplier: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('updateSupplier', payload.data);
                    resolve();
                }, 1000);
            });
        },

        addSupplier: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('addSupplier', payload.data);
                    resolve();
                }, 1000);
            });
        }
    }
}