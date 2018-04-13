<template>
    <div>
        <template v-for="(prices, route) of getPrices(pullmans)">
            <b-row :key="route">
                <b-col cols="10"><h4>Tappa #{{route+1}}: {{ getRoute(route) }}</h4></b-col>
            </b-row>
            <b-row class="mt-2" v-for="(price, p) of prices" :key="p">
                <b-col cols="2">
                    <input type="radio" v-model="selected[route]" :value="{cost: price.price, pullman: price.pullman, route: price.route}" />
                </b-col>
                <b-col cols="5"><h6>{{ price.pullman.name }}</h6></b-col>
                <b-col cols="5" class="text-center">
                    <i class="fa fa-money"></i> {{ price.price }} {{ $app.configs.currency }}
                </b-col>
            </b-row>
        </template>
        <b-row class="mt-2" v-if ="selectedCount > 1">
            <b-col cols="6">
                <h4>Totale:</h4>
                <i class="fa fa-money"></i> {{ getTotalPrice() }} {{ $app.configs.currency }}
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
    import RouteList from '../classes/RouteList';
    
    export default {
        name: 'price-trf',

        props: ['pullmans', 'routes'],

        data: function(){
            return {
                selected: [],
                selectedCount: 0
            }
        },

        watch: {
            selected: function(){
                this.selectedCount++;
            }
        },

        mounted: function(){
            for(let route of this.routes.toArray()){
                if(route.duration !== undefined){
                    this.selected.push({});
                }
            }  
            this.selectedCount = 0;
        },

        methods: {
            getPrices: function(pullmans){
                let prices = [];
                for(let route of this.routes.toArray()){
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
                                price: priceManager.price(),
                                route: RouteList.toModel(route)
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

                prices = prices.sort((a, b) => {
                    if(a[0].price < b[0].price){
                        return -1;
                    }else if (a[0].price > b[0].price){
                        return 1;
                    }

                    return 0;
                });
                return prices;
            },

            getRoute: function(route){
                const routes = this.routes.toArray();
                if(route > routes.length - 1){
                    return '';
                }

                return routes[route].from.locality + ' - ' + routes[route].to.locality;
            },

            getTotalPrice: function(){
                let total = 0.00;
                for(let route of this.selected){
                    if(route.cost !== undefined){
                        total += parseFloat(route.cost);
                    }
                }
                return total.toFixed(2);
            },

            getRental: function(price){
                let r = this.routes.find(r => r.id === price.route.id);
                let rentalRoutes = [];
                if(r !== undefined){
                    rentalRoutes.push(_.cloneDeep(RouteList.toModel(r)));
                }
                return {
                    cost: price.cost, 
                    type: PriceManager.TRF,
                    routes: rentalRoutes
                }
            },

            onSelect: function(){
                let rentals = [];
                for(let selected of this.selected){
                    if(selected.cost !== undefined){
                        rentals.push(this.getRental(selected));
                    }
                }
                this.$emit('onBooking', rentals);
            }
        }
    }
</script>
