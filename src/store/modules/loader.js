export default{
    state: {
        calls: []
    },

    getters: {
        pendingCalls: function(state){
            return state.calls.length;
        },

        total: function(state){
            return state.calls.length;
        },

        callMsg: function(state){
            const pending = state.calls;
            if(pending.length == 0){
                return '';
            }
            return pending[0].msg;
        }
    },

    mutations: {
        setAction: function(state, action){
            state.calls.push({
                call: action.type,
                msg: action.payload.msg,
            });
        },

        setPending: function(state){
            state.calls.pop();
        }
    }
}