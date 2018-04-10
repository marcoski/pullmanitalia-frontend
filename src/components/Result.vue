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
                                <li v-for="(route, index) in routes">
                                    <div class="trip-steps-content">
                                        <b-row>
                                            <b-col cols="7">{{ route.loc.locality }}</b-col>
                                            <b-col cols="5">{{ getRouteDateStr(route) }}</b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col cols="7">{{ route.loc.address }}</b-col>
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
                            <template v-if="index == 0"> <!-- DISP -->
                                <b-alert variant="success" show v-if="isDisp()">Il viaggio può essere un tour in giornata</b-alert>
                                <b-alert variant="warning" show v-else>Il viaggio non può essere un tour in giornata</b-alert>
                                <template v-if="pullmanLoaded && isDisp()">
                                    <b-row v-for="(price, p) of getPrices(index, pullmans)">
                                        <b-col cols="4"><h4>{{ price.pullman.name }}</h4></b-col>
                                        <b-col cols="8" class="text-center">
                                            <i class="fa fa-money"></i> {{ price.price }} {{ $app.configs.currency }}
                                        </b-col>
                                    </b-row>
                                </template>
                            </template>
                            <template v-else-if="index == 1"> <!-- TRF -->
                                <b-alert variant="success" show v-if="isTrf()">Il viaggio può essere composto di {{ routes.length - 1 }} trasferimenti singoli</b-alert>
                                <b-alert variant="warning" show v-else>Il viaggio può essere composto anche come un tour</b-alert>
                                <template v-if="pullmanLoaded && isTrf()">
                                    <template v-for="(prices, route) of getPricesTrf(pullmans)">
                                        <b-row>
                                            <b-col><h4>Tappa #{{route+1}}</h4></b-col>
                                        </b-row>
                                        <b-row class="mt-2" v-for="(price, p) of prices">
                                            <b-col cols="4"><h6>{{ price.pullman.name }}</h6></b-col>
                                            <b-col cols="8" class="text-center">
                                                <i class="fa fa-money"></i> {{ price.price }} {{ $app.configs.currency }}
                                            </b-col>
                                        </b-row>
                                    </template>
                                </template>
                            </template>
                            <template v-else-if="index == 2"> <!-- TOUR -->
                                <b-alert variant="success" show v-if="isTourTrip()">Il viaggio è un tour</b-alert>
                                <b-alert variant="warning" show v-else>Il viaggio non può essere un tour</b-alert>
                                <template v-if="pullmanLoaded && isTourTrip()">
                                    <b-row v-for="(price, p) of getPrices(index, pullmans)">
                                        <b-col cols="4"><h4>{{ price.pullman.name }}</h4></b-col>
                                        <b-col cols="8" class="text-center">
                                            <i class="fa fa-money"></i> {{ price.price }} {{ $app.configs.currency }}
                                        </b-col>
                                    </b-row>
                                </template>
                            </template>
                            
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
    import PriceManager from '../classes/Price/PriceManager';

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

        mounted: function(){
            this.pullmanLoaded = false;
            this.$store.dispatch('loadPullmans', {msg: 'Carico pullmans...'}).then(() => {
                this.pullmans = this.$store.getters.allPullmans
                this.pullmanLoaded = true;
            });
        },

        computed: {
            center: function(){
                return {
                    lat: parseFloat(this.routes[0].loc.lat),
                    lng: parseFloat(this.routes[0].loc.lng)
                };
            },

            markers: function(){
                let markers = [];
                for(const route of this.routes){
                    let marker = {};
                    marker.loc = {
                        lat: parseFloat(route.loc.lat),
                        lng: parseFloat(route.loc.lng)
                    }
                    marker.title = route.loc.address;
                    markers.push(marker);
                }
                return markers;
            },

            origin: function(){
                return {
                    lat: parseFloat(this.routes[0].loc.lat),
                    lng: parseFloat(this.routes[0].loc.lng)
                }
            },

            destination: function(){
                return {
                    lat: parseFloat(this.routes[this.routes.length - 1].loc.lat),
                    lng: parseFloat(this.routes[this.routes.length - 1].loc.lng)
                }
            },

            waypoints: function(){
                let waypoints = [];

                for(let i = 1; i < this.routes.length - 1; i++){
                    const waypoint = {};
                    waypoint.location = {
                        lat: parseFloat(this.routes[i].loc.lat),
                        lng: parseFloat(this.routes[i].loc.lng)
                    };

                    waypoints.push(waypoint);
                }

                return waypoints;
            },

            totalTravelDistance: function(){
                let totalDistance = 0;

                for(let i = 1; i < this.routes.length; i++){
                    totalDistance += this.routes[i].distance;
                }

                return totalDistance;
            },

            totalTravelDuration: function(){ 
                return DateTimeHandler.getDurationDiff(
                    moment(this.routes[0].departure),
                    moment(this.routes[this.routes.length - 1].arrival)
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

            isDisp: function(){
                let duration = this.totalTravelDuration * 1000;
                if(this.routes.length > 2 && moment.duration(duration).asHours() <= 24){
                    const start = this.routes[0];
                    const end = this.routes[this.routes.length - 1];
                    if(start.loc.address === end.loc.address){
                        return true;
                    }
                }

                return false;
            },

            isTrf: function(){
                return (!this.isDisp() && !this.isTour);
            },

            isTourTrip: function(){
                return (!this.isDisp() && this.isTour && this.routes.length > 2);
            },

            getPrices: function(type, pullmans){
                let prices = [];
                for(let pullman of pullmans){
                    const priceManager = new PriceManager(
                        type, 
                        pullman, 
                        moment.duration(this.totalTravelDuration * 1000),
                        Math.round(this.totalTravelDistance / 1000)
                    );
                    let price = {
                        pullman: pullman,
                        price: priceManager.price()
                    }
                    prices.push(price);
                }

                return prices.sort((a, b) => {
                    if(a.price < b.price){
                        return -1;
                    }else if(a.price > b.price){
                        return 1;
                    }

                    return 0;
                });
            },

            getPricesTrf: function(pullmans){
                let prices = [];
                for(let route of this.routes){
                    if(route.duration !== undefined){
                        let routePrices = [];
                        for(let pullman of this.pullmans){
                            const priceManager = new PriceManager(
                                PriceManager.TRF,
                                pullman,
                                moment.duration(route.duration * 1000),
                                Math.round(route.distance / 1000)
                            )
                            let price = {
                                pullman: pullman,
                                price: priceManager.price()
                            }
                            routePrices.push(price);
                        }
                        prices.push(routePrices.sort((a, b) => {
                            if(a.price < b.price){
                                return -1;
                            }else if(a.price > b.price){
                                return 1;
                            }

                            return 0;
                        }));
                    }
                }

                return prices.sort((a, b) => {
                    if(a[0].price < b[0].price){
                        return -1;
                    }else if (a[0].price > b[0].price){
                        return 1;
                    }

                    return 0;
                });
            }
        }
    }
</script>