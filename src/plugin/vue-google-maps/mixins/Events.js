export default {
    beforeCreate: function(){
        this.$_googleListeners = []
    },

    beforeDestroy: function(){
        for(const listener of this.$_googleListeners){
            listener.remove();
        }
    },

    methods: {
        listen: function(target, event, handler){
            this.$_googleListeners.push(target.addListener(event, handler));
        },

        addListener: function(target, event, handler){
            return target.addListener(event, handler);
        },

        removeListener: function(target, listener){
            target.removeListener(listener);
        },

        redirectEvents: function(target, events){
            for(const e of events){
                this.listen(target, e, (...args) => {
                    this.$emit(e, ...args)
                });
            }
        }
    }
}