import { bindProp } from '../util/bindprop';

export default {
    beforeDestroy: function(){
        this.unbindProps();
    },

    methods: {
        bindProps: function(target, props){
            this.unbindProps();
            this.$_boundProps = [];
            for(const prop of props){
                let options = {
                    vm: this,
                    target: target
                }

                if(typeof prop === 'string'){
                    options.name = prop;
                }else{
                    Object.assign(options, prop)
                }
                this.$_boundProps.push(bindProp(options));
            }
        },

        unbindProps: function(){
            if(this.$_boundProps){
                this.$_boundProps.forEach(unbind => unbind())
            }
        }
    }
}