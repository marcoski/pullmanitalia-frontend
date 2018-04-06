import loader from "../loader";
import {handleError} from "../util/error";

export default {
    data: function(){
        return {
            googleMapsReady: false
        }
    },

    mounted: async function(){
        await loader.ensureReady()
        {
            const handlers = this.$options.googleMapsPrepare;
            if(handlers){
                const promises = [];
                for(let i = 0; i < handlers.length; i++){
                    try{
                        const result = handlers[i].call(this);
                        if(typeof result.then === 'function'){
                            promises.push(result);
                        }
                    }catch (e){
                        handleError(e, this, 'googleMapsPrepare hook');
                    }
                }

                await Promise.all(promises);
            }
        }

        this.googleMapsReady = true
        {
            const handlers = this.$options.googleMapsReady;
            if(handlers){
                for(let i = 0; i < handlers.length; i++){
                    try{
                        handlers[i].call(this);
                    }catch(e){
                        handleError(e, this, 'googleMapsReady hook')
                    }
                }
            }
        }
        this.$emit('ready');
    }
}