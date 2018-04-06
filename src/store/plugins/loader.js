import _ from 'lodash';

export default store => {
    store.subscribe((mutation, state) => {
        if(!(mutation.type == 'setAction' || mutation.type == 'setPending')){
            store.commit('setPending');
        }
    });

    store.subscribeAction(action => {
        store.commit('setAction',  action);
    });
}