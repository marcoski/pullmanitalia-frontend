import {initErrorHandling} from "./util/error";
import GMapsLoader from "./loader";
import Autocomplete from "./components/Autocomplete";
import Map from "./components/Map";
import Marker from "./components/Marker";
import Directions from "./components/Directions";

function optionMergeStrategies(Vue){
    const strats = Vue.config.optionMergeStrategies;
    strats.googleMapsReady = strats.created;
    strats.googleMapsPrepare = strats.created;
}

export {
    Autocomplete,
    Marker,
    Directions,
    Map
}

function registerComponents(Vue, prefix){
    Vue.component(`${prefix}autocomplete`, Autocomplete);
    Vue.component(`${prefix}marker`, Marker);
    Vue.component(`${prefix}directions`, Directions);
    Vue.component(`${prefix}map`, Map);
}

const GoogleMapsPlugin = {

    install: function(Vue, options){
        const finalOptions = Object.assign({}, {
            installComponents: true,
            componentsPrefix: 'google-maps-'
        }, options);

        optionMergeStrategies(Vue);
        initErrorHandling(Vue);

        if(finalOptions.installComponents){
            registerComponents(Vue, finalOptions.componentsPrefix);
        }

        if(finalOptions.load){
            GMapsLoader.load(finalOptions.load);
        }
    }
};

export default GoogleMapsPlugin;