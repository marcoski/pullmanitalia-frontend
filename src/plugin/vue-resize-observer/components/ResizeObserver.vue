<template>
  <div class="resize-observer" tabindex="-1"></div>
</template>

<script>
import { getIEVersion } from "../utils/compatibility";

let isIE;

function initCompat(){
    if(!initCompat.init){
        initCompat.init = true;
        isIE = getIEVersion() !== -1;
    }
}

export default {
    name: 'resize-observer',

    methods: {
        notify: function(){
            this.$emit('notify');
        },

        addResizeHandlers: function(){
            this._resizeObject.contentDocument.defaultView.addEventListener('resize', this.notify);
            if(this._w !== this.$el.offsetWidth || this._h !== this.$el.offsetHeight){
                this.notify();
            }
        },

        removeResizeHandlers: function(){
            if(this._resizeObject && this._resizeObject.onload){
                if(!isIE && this._resizeObject.contentDocument){
                    this._resizeObject.contentDocument.defaultView.removeEventListener('resize', this.notify);
                }

                delete this._resizeObject.onload;
            }
        }
    },

    mounted: function(){
        initCompat();
        this.$nextTick(() => {
            this._w = this.$el.offsetWidth;
            this._h = this.$el.offsetHeight;
        });

        const object = document.createElement('object');
        this._resizeObject = object;
        object.setAttribute('style', 'display:block; posizion:absolute; top:0; left:0; height:100%; width:100; overflow:hidden; pointer-events: none; z-index:-1;');
        object.setAttribute('aria-hidden', 'true');
        object.setAttribute('tabindex', -1);
        object.onload = this.addResizeHandlers
        object.type = 'text/html';

        if(isIE){
            this.$el.appendChild(object);
        }

        object.data = 'about:blank';

        if(!isIE){
            this.$el.appendChild(object);
        }
    },

    beforeDestroy: function(){
        this.removeResizeHandlers();
    }

}
</script>

<style scoped>
.resize-observer{
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    border: none;
    background-color: transparent;
    pointer-events: none;
    display: block;
    overflow: hidden;
    opacity: 0;
}
</style>
