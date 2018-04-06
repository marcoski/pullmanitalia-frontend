import _ from 'lodash';
import Customers from "../../data/_customers";

export default {
    state: {
        customers: {
            items: [],
            count: 0
        },
    },

    getters: {
        allCustomers: function(state){
            const customers = _.cloneDeep(state.customers);
            return customers.items;
        },

        countCustomers: function(state){
            return state.customers.count;
        },

        getCustomerById: function(state){
            return function(id){
                const customers = _.cloneDeep(state.customers.items);
                return customers.items.find(item => item.id == id);
            }
        },
    },

    mutations: {
        loadCustomers: function(state, c){
            state.customers.items = c.items;
            state.customers.count = c.count;
        },

        deleteCustomers: function(state, customers){
            _.remove(state.customers.items, c => customers.includes(c.id));
            state.customers.count = state.customers.items.length;
        },

        updateCustomer: function(state, customer){
            let c = state.customers.items.findIndex(item => item.id == customer.id);
            if(c !== undefined){
                state.customers.items[c] = _.cloneDeep(customer);
            }
        },

        addCustomer: function(state, customer){
            customer.id = state.customers.count;
            state.customers.count++;
            state.customers.items.push(customer);
        }
    },

    actions: {
        loadCustomers: function(context){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('loadCustomers', Customers);
                    resolve();
                }, 1000);
            });
        },

        deleteCustomers: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('deleteCustomers', payload.data);
                    resolve();
                }, 1000);
            });
        },

        updateCustomer: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('updateCustomer', payload.data);
                    resolve();
                }, 1000)
            });
        },

        addCustomer: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('addCustomer', payload.data);
                    resolve();
                }, 1000);
            });
        }
    }
}