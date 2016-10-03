<template>
    <div>
        <b-row v-for="(price, p) of getPrices(pullmans)">
            <b-col cols="2"><input type="radio" v-model="selected" :value="{cost: price.price, pullman: price.pullman}"/></b-col>
            <b-col cols="5"><h4>{{ price.pullman.name }}</h4></b-col>
            <b-col cols="5" class="text-center">
                <i class="fa fa-money"></i> {{ price.price }} {{ $app.configs.currency }}
            </b-col>
        </b-row>
       <b-row class="mt-2" v-if ="selected.cost !== undefined">
            <b-col cols="6">
                <h4>Totale:</h4>
                <i class="fa fa-money"></i> {{ selected.cost }} {{ $app.configs.currency }}
            </b-col>
            <b-col cols="6" class="text-right">
                <b-btn @click.prevent="onSelect">Prenota</b-btn>
            </b-col>
        </b-row>
    </div>
    
</template>

<script>    
    import moment from 'moment';
    import _ from 'lodash';
    import PriceManager from '../classes/Price/PriceManager';
    
    export default {
        name: 'price-disp-tour',

        props: ['pullmans', 'totalTravelDuration', 'totalTravelDistance', 'strategy', 'routes'],

        data: function(){
            return {
                selected: {}
            }
        },

        methods: {
            getPrices: function(pullmans){
                let prices = [];
                for(let pullman of pullmans){
                    const priceManager = new PriceManager(
                        this.strategy, 
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

            getRental: function(price){
                let rentalRoutes = [];
                for(let route of this.routes.toArray()){
                    let rentalRoute = _.cloneDeep(route);
                    rentalRoute.pullman = price.pullman;
                    rentalRoutes.push(rentalRoute);
                }
                let rental = {
                    cost: price.cost, 
                    type: this.strategy,
                    routes: rentalRoutes
                }
                return rental;
            },

            onSelect: function(){
                let rentals = [this.getRental(this.selected)];
                this.$emit('onBooking', rentals);
            }
        }
    }
</script>
