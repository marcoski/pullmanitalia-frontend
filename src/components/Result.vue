<template>
    <section class="result-container">
        <header class="modal-header">
            <h5 class="modal-title">Risultati ricerca</h5>
            <button type="button" class="close" @click.prevent="close">x</button>
        </header>
        <b-container fluid>
            <b-row>
                <b-col cols="4">
                    <b-card header-tag="header" footer-tag="footer">
                        <h6 class="card-title" slot="header">Mappa</h6>
                        <div slot="footer">
                            <b-row>
                                <b-col><i class="icon icon-map"></i> {{ getTotalDistanceStr() }} </b-col>
                                <b-col><i class="icon icon-clock"></i> {{ getTotalTravelTimeStr() }}</b-col>
                                <b-col><i class="icon icon-child"></i> {{ passengers }}</b-col>
                            </b-row>
                        </div>
                        <google-maps-map ref="routesMap" class="map" :zoom.sync="mapZoom" :center="center">
                            <template v-for="marker in markers">
                                <google-maps-marker :title="marker.title" :position="marker.loc"></google-maps-marker>
                            </template>
                            <google-maps-directions 
                                :origin="origin" 
                                :destination="destination" 
                                :waypoints="waypoints"
                                @complete=""
                            />
                        </google-maps-map>
                    </b-card>
                    <b-card header-tag="header" class="mt-2">
                        <h6 slot="header" class="card-title">Tappe</h6>
                        <div class="trip-steps">
                            <ul>
                                <li v-for="(route, index) in routes.getSteps()">
                                    <div class="trip-steps-content">
                                        <b-row>
                                            <b-col cols="7">{{ route.locality }}</b-col>
                                            <b-col cols="5">{{ getRouteDateStr(route) }}</b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col cols="7">{{ route.address }}</b-col>
                                            <b-col cols="5" v-if="route.duration !== undefined">{{ getRouteDurationStr(route) }} di viaggio</b-col>
                                        </b-row>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </b-card>
                </b-col>
                <b-col cols="8">
                    <template v-for="(tripType, index) in tripTypes">
                        <b-card header-tag="header" class="mb-4">
                            <h6 slot="header" class="card-title">
                                <template v-if="!pullmanLoaded">
                                    <i class="fa fa-circle-o-notch fa-spin fa-fw"></i> Genero soluzioni...
                                </template>
                                <template v-else>
                                    <i class="fa fa-bus"></i> Tipo: {{ tripType }}
                                </template>
                            </h6>
                            <price 
                                :totalTravelDuration="totalTravelDuration"
                                :totalTravelDistance="totalTravelDistance"
                                :routes="routes"
                                :isTour="isTour"
                                :pullmanLoaded="pullmanLoaded"
                                :pullmans="pullmans"
                                :strategy="index"
                                v-on:onBooking="onBooking"
                            >
                            </price>
                        </b-card>
                    </template>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import moment from 'moment';
    import DateTimeHandler from '../classes/DateTimeHandler';
    import Price from './Prices';

    export default {
        name: 'result',

        props: ['routes', 'passengers', 'isTour'],

        data: function(){
            return {
                mapZoom: 6,
                tripTypes: this.$app.configs.tripTypes,
                pullmans: [],
                pullmanLoaded: false
            }
        },

        components: {
            Price
        },

        mounted: function(){
            this.pullmanLoaded = false;
            this.$store.dispatch('loadPullmans', {msg: 'Carico pullmans...'}).then(() => {
                this.pullmans = this.$store.getters.allPullmans
                this.pullmanLoaded = true;
            });
        },

        computed: {
            center: function(){
                const start = this.routes.getFirst();
                return {
                    lat: parseFloat(start.from.lat),
                    lng: parseFloat(start.from.lng)
                };
            },

            markers: function(){
                let markers = [];
                for(const route of this.routes.getSteps()){
                    let marker = {};
                    marker.loc = {
                        lat: parseFloat(route.lat),
                        lng: parseFloat(route.lng)
                    }
                    marker.title = route.address;
                    markers.push(marker);
                }
                return markers;
            },

            origin: function(){
                const start = this.routes.getFirst();
                return {
                    lat: parseFloat(start.from.lat),
                    lng: parseFloat(start.from.lng)
                }
            },

            destination: function(){
                const end = this.routes.getLast();
                return {
                    lat: parseFloat(end.to.lat),
                    lng: parseFloat(end.to.lng)
                }
            },

            waypoints: function(){
                let waypoints = [];
                const routes = this.routes.getSteps();
                for(let i = 1; i < routes.length - 1; i++){
                    const waypoint = {};
                    waypoint.location = {
                        lat: parseFloat(routes[i].lat),
                        lng: parseFloat(routes[i].lng)
                    };

                    waypoints.push(waypoint);
                }

                return waypoints;
            },

            totalTravelDistance: function(){
                let totalDistance = 0;
                let route = this.routes.getFirst();
                while(route){
                    totalDistance += route.distance;
                    route = route.next;
                }
                
                return totalDistance;
            },

            totalTravelDuration: function(){ 
                const start = this.routes.getFirst();
                const end = this.routes.getLast();
                return DateTimeHandler.getDurationDiff(
                    moment(start.departure),
                    moment(end.arrival)
                );
            }
        },

        methods: {
            close: function(){
                this.$emit('close');
            },

            getTotalDistanceStr: function(){
                return Math.round(this.totalTravelDistance / 1000) + " Km";
            },

            getTotalTravelTimeStr: function(){
                return DateTimeHandler.getDurationString(this.totalTravelDuration);
            },

            getRouteDateStr: function(route){
                let date;
                if(route.departure !== undefined){
                    date = route.departure;
                }else{
                    date = route.arrival;
                }
                return moment(date).format(this.$app.configs.moment_datetime_format);
            },

            getRouteDurationStr: function(route){
                return DateTimeHandler.getDurationString(route.duration);
            },

            onBooking: function(rents){
                let rentals = rents.map((r) => {
                    r.passengers = this.passengers
                    return r;
                });
                this.$emit('onBooking', rentals);
            }
        }
    }
</script>