import MapElement from "../mixins/MapElement";

export default {
    name: 'google-maps-directions',

    mixins: [MapElement],

    props: {
        avoidFerries: {
            type: Boolean
        },
        avoidHighways: {
            type: Boolean
        },
        avoidTolls: {
            type: Boolean
        },
        destination: {
            type: Object,
            required: true,
        },
        drivingOptions: {
            type: Object
        },
        optimizeWaypoints: {
            type: Boolean,
            default: false
        },
        origin: {
            type: Object,
            required: true
        },
        transitOptions: {
            type: Object
        },
        travelMode: {
            type: String,
            default: 'DRIVING'
        },
        unitSystem: {
            type: String,
        },
        waypoints: {
            type: Array
        }
    },

    render: function(h){
        if(!this.$slots.default || this.$slots.default.length === 0){
            return '';
        }else if(this.$slots.default.length === 1){
            return this.$slots.default[0];
        }else{
            return h('div', this.$slots.default);
        }
    },

    methods: {
        route: function(options){
            return new Promise((resolve) => {
                const ds = new google.maps.DirectionsService;
                const dr = new google.maps.DirectionsRenderer;
                dr.setMap(this.$_map);

                ds.route(options, (response, status) => {
                    if(status === 'OK'){
                        dr.setDirections(response);
                        resolve(response, dr);        
                    }else{
                        let error = 'A directions request could not be processed due to a server error. The request may succeed if you try again.'
                        if(status === 'INVALID_REQUEST'){
                            error = 'The DirectionRequests provided was invalid.';
                        }else if(status === 'MAX_WAYPOINTS_EXCEEDED'){
                            error = 'Too many DirectionsWaypoints were provided in the DirectionsRequest due to a KEY problems.';
                        }else if(status === 'NOT_FOUND'){
                            error = 'At least one of the origin, destination, or waypoints could not be geocoded.';
                        }else if(status === 'OVER_QUERY_LIMIT'){
                            error = 'The webpage has gone over the request limit in too short a period of time.';
                        }else if(status === 'REQUEST_DENIED'){
                            error = 'The webpage is not allowed to use the direction service.'
                        }else if(status === 'ZERO_RESULTS'){
                            error = 'No route could be found between the origin and the destination.'
                        }
                        throw new Error(status +': ' + error);
                    }
                });
            });
        },

        onRouteComplete: function(response, dr){
            this.$emit('complete', response);
        }
    },

    googleMapsReady: function(){
        const options = Object.assign({}, this.$props);
        const routePromise = this.route(options);
        routePromise.then(this.onRouteComplete);
    }
}