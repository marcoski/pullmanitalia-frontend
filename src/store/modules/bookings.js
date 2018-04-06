import _ from 'lodash';
import Bookings from "../../data/_bookings";

export default {
    state: {
        bookings: {
            items: [],
            count: 0
        },
    },

    getters: {
        allBookings: function(state){
            const bookings = _.cloneDeep(state.bookings);
            return bookings.items;
        },

        countBookings: function(state){
            return state.bookings.count;
        },

        getBookingById: function(state){
            return function(id){
                const bookings = _.cloneDeep(state.bookings);
                return bookings.items.find(item => item.id == id);
            }
        },
    },

    mutations: {
        loadBookings: function(state, b){
            state.bookings.items = b.items;
            state.bookings.count = b.count;
        },

        deleteBookings: function(state, bookings){
            _.remove(state.bookings.items, b => bookings.includes(b.id));
            state.bookings.count = state.bookings.items.length;
        },

        updateBooking: function(state, booking){
            let b = state.bookings.items.findIndex(item => item.id == booking.id);
            if(b !== undefined){
                state.bookings.items[b] = _.cloneDeep(booking);
            }
        },

        addBooking: function(state, booking){
            booking.id = state.bookings.count;
            state.bookings.count++;
            state.bookings.items.push(booking);
        }
    },

    actions: {
        loadBookings: function(context){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('loadBookings', Bookings);
                    resolve();
                }, 1000);
            });
        },

        deleteBookings: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('deleteBookings', payload.data);
                    resolve();
                }, 1000);
            });
        },

        updateBooking: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('updateBooking', payload.data);
                    resolve();
                }, 1000)
            });
        },

        addBooking: function(context, payload){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('addBooking', payload.data);
                    resolve();
                }, 1000);
            });
        }
    }
}