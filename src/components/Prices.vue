<template>
    <div>
        <template v-if="strategy == 0"> <!-- DISP -->
            <b-alert variant="success" show v-if="isDisp()">Il viaggio può essere un tour in giornata</b-alert>
            <b-alert variant="warning" show v-else>Il viaggio non può essere un tour in giornata</b-alert>
            <price-disp-tour 
                v-if="pullmanLoaded && isDisp()" 
                :pullmans="pullmans" 
                :totalTravelDuration="totalTravelDuration"
                :totalTravelDistance="totalTravelDistance"
                :strategy="strategy"
                :routes="routes"
                v-on:onBooking="onBooking"
            ></price-disp-tour>
        </template>
        <template v-else-if="strategy == 1"> <!-- TRF -->
            <b-alert variant="success" show v-if="isTrf()">Il viaggio può essere composto di {{ routes.count() }} trasferimenti singoli</b-alert>
            <b-alert variant="warning" show v-else>Il viaggio può essere composto anche come un tour</b-alert>
            <price-trf v-if="pullmanLoaded && isTrf()" :pullmans="pullmans" :routes="routes" v-on:onBooking="onBooking"></price-trf>
        </template>
        <template v-else-if="strategy == 2"> <!-- TOUR -->
            <b-alert variant="success" show v-if="isTourTrip()">Il viaggio è un tour</b-alert>
            <b-alert variant="warning" show v-else>Il viaggio non può essere un tour</b-alert>
            <price-disp-tour 
                v-if="pullmanLoaded && isTourTrip()" 
                :pullmans="pullmans"
                :totalTravelDuration="totalTravelDuration"
                :totalTravelDistance="totalTravelDistance"
                :strategy="strategy"
                :routes="routes"
                v-on:onBooking="onBooking"
            ></price-disp-tour>
        </template>       
    </div>
</template>

<script>
    import moment from 'moment';
    import PriceTrf from './PriceTrf';
    import PriceDispTour from './PriceDispTour';

    export default {
        name: 'prices',

        props: ['totalTravelDuration', 'totalTravelDistance', 'routes', 'isTour', 'pullmanLoaded', 'strategy', 'pullmans'],

        components: {
            PriceTrf,
            PriceDispTour
        },

        methods: {
            isDisp: function(){
                let duration = this.totalTravelDuration * 1000;
                if(this.isTour && this.routes.count() > 1 && moment.duration(duration).asHours() <= 24){
                    const start = this.routes.getFirst();
                    const end = this.routes.getLast();
                    if(start.from.address === end.to.address){
                        return true;
                    }
                }

                return false;
            },

            isTrf: function(){
                return (!this.isDisp() && !this.isTour);
            },

            isTourTrip: function(){
                return (!this.isDisp() && this.isTour && this.routes.count() > 1);
            },

            onBooking: function(rentals){
                this.$emit('onBooking', rentals);
            }
        }
    }
</script>
