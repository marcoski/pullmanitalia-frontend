import MainNav from '../../data/_main-nav';
import LoggedUser from '../../data/_user-admin';

export default {
    state: {
        configs: {},
        navigation: {},
        loggedUser: {}
    },
    
    getters: {
        navigation: function(state){
            return state.navigation;
        },

        logged: function(state){
            return state.loggedUser;
        }
    },
    
    mutations:  {
        loadMainNav: function(state, nav){
            state.navigation = nav.items;
        },

        loadLoggedUser: function(state, user){
            state.loggedUser = user;
        }
    },
    
    actions: {
        loadMainNav: function(context){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('loadMainNav', MainNav);
                    resolve();
                }, 1000);
            });
        },

        loadLoggedUser: function(context){
            return new Promise(resolve => {
                setTimeout(() => {
                    context.commit('loadLoggedUser', LoggedUser);
                    resolve();
                }, 1000);
            });
        }
    }
}