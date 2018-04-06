import ResizeObserver from "./components/ResizeObserver.vue";

export {
    ResizeObserver
}

const VueResizeObserverPlugin = {
    install: function(Vue){
        Vue.component('resize-observer', ResizeObserver);
    }
};

export default VueResizeObserverPlugin;