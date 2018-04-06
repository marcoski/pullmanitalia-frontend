import _ from 'lodash';
import Rentals from "../../data/_rentals";

export default {
    state: {
        rentals: {
            items: [],
            count: 0
        },
    },

    getters: {
        allRentals: function(state){
            const rentals = _.cloneDeep(state.rentals);
            return rentals.items;
        },

        countRentals: function(state){
            return state.rentals.count;
        },

        getRentalById: function(state){
            return function(id){
                const rentals = _.cloneDeep(state.rentals.items);
                return rentals.items.find(item => item.id == id);
            }
        },
    },

    mutations: {
        loadRentals: function(state, r){
            state.rentals.items = r.items;
            state.rentals.count = r.count;
        },

        deleteRentals: function(state, rentals){
            _.remove(state.rentals.items, r => rentals.includes(r.id));
            state.rentals.count = state.rentals.items.length;
        },

        updateRental: function(state, rental){
            let r = state.rentals.items.findIndex(item => item.id == rental.id);
            if(r !== undefined){
                state.rentals.items[r] = _.cloneDeep(rental);
            }
        },

        addRental: function(state, rental){
            rental.id = state.rentals.count;
            state.rentals.count++;
            state.rentals.items.push(rental);
        }
    },

    actions: {
        loadRental: function(context){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('loadRental', Rentals);
                    resolve();
                }, 1000);
            });
        },

        deleteRental: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('deleteRental', payload.data);
                    resolve();
                }, 1000);
            });
        },

        updateRental: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('updateRental', payload.data);
                    resolve();
                }, 1000);
            });
        },

        addRental: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('addRental', payload.data);
                    resolve();
                }, 1000);
            });
        }
    }
}