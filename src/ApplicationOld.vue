<template>
    <div>
        <section :class="['plan-container', planClass]">
            <b-container>
                <div class="plan-content">
                    <h3>Inizia il tuo viaggio</h3>
                    <b-form>
                        <b-row>
                            <b-col>
                                <b-card header="Inizia...">
                                    <b-row>
                                        <b-col>
                                            <b-form-group label="Numero di partecipanti" description="Puoi inserire anche un numero indicativo">
                                                <b-form-input type="text" v-model="passengers"></b-form-input>
                                            </b-form-group>
                                        </b-col>
                                        <b-col>
                                            <b-form-checkbox v-model="isTour">
                                                Vuoi il pullman sempre a disposizione?
                                            </b-form-checkbox>
                                        </b-col>
                                    </b-row>
                                </b-card>
                            </b-col>
                        </b-row>
                        <b-row class="mt-2 mb-2">
                            <b-col>
                                <route-form 
                                    id="a-1" 
                                    title="Partenza"
                                    v-on:route:changelocation="onChangeLocation"
                                    v-on:route:changedate="onChangeDate"
                                    :route="getRoute(0)"
                                ></route-form>
                                <template v-for="(routeComponent, index) in routesComponents">
                                    <component 
                                        v-bind:is="routeComponent.component" 
                                        :id="routeComponent.id" 
                                        :title="routeComponent.title"
                                        :isLast="index === routesComponents.length - 1"
                                        :count="routesComponents.length"
                                        :route="getRoute(index + 1)"
                                        :hasArrival="routeComponent.hasArrival"
                                        @route:changelocation="onChangeLocation"
                                        @route:changedate="onChangeDate"
                                        @route:return="onReturn"
                                    >
                                    </component>
                                </template>
                            </b-col>
                        </b-row>
                        <b-row class="mt-2 mb-2">
                            <b-col>
                                <b-button-group>
                                    <b-button size="md" variant="primary" @click.prevent="addRouteComponent">
                                        <i class="fa fa-plus"></i> Aggiungi tappa / ritorno
                                    </b-button>
                                    <b-button v-if="routes.length > 2" size="md" variant="warning" @click.prevent="removeRouteComponent">
                                        <i class="fa fa-minus"></i> Rimuovi tappa
                                    </b-button>
                                </b-button-group>
                            </b-col>
                        </b-row>
                        <b-row v-if="error">
                            <b-col>
                                <b-alert 
                                    :show="errorCountdown"
                                    variant="warning"
                                    dismissible 
                                    @dismissed="errorCountdown=0"
                                    @dismiss-count-down="errorCountdownChange"
                                >{{ errorMessage }}</b-alert>
                            </b-col>
                        </b-row>
                        <b-row class="mt-3 mb-3">
                            <b-col>
                                <b-button size="lg" variant="primary" @click.prevent="submit(false)">
                                    <i class="fa fa-search"></i>
                                    Cerca
                                </b-button>
                            </b-col>
                        </b-row>
                    </b-form>
                </div>
            </b-container>
        </section>
        <result 
            v-if="isSubmit"
            :class="[resultDisplay]"  
            :routes="routes" 
            :passengers="passengers"
            :isTour="isTour"
            @close="onResultClose"
            v-on:onBooking="onBooking"
        ></result>
        <booking
            v-if="isBooking"
            :class="[bookingDisplay]"
            :rentals="rentals"
            @close="onBookingClose"
        ></booking>
        <b-modal ref="setReturnModal" hide-footer hide-header centered no-close-on-backdrop no-close-on-esc>
            <b-container fluid class="text-center return-modal">
                <b-row>
                    <b-col>
                        <h4>Desideri inserire il ritorno?</h4>
                        <p></p>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-btn class="mt-3" variant="outline-warning" block @click="onReturnModalOk">Si, voglio il ritorno!</b-btn>
                    </b-col>
                    <b-col>
                        <b-btn class="mt-3" variant="outline-warning" block @click="onReturnModalCancel">No, viaggio di sola andata</b-btn>
                    </b-col>
                </b-row>
            </b-container>
        </b-modal>
     </div>
    
</template>

<script>
    import RouteForm from './components/RouteForm';
    import Result from './components/Result';
    import Booking from './components/Booking';
    import DateTimeHandler from './classes/DateTimeHandler';
    import Ready from './plugin/vue-google-maps/mixins/Ready';
    import moment from 'moment';
    import RouteList from './classes/RouteList';
    import Route from './classes/Route';

    export default {
        name: 'app',

        components: {
            RouteForm,
            Result,
            Booking
        },

        mixins: [
            Ready
        ],

        data: function(){
            return {
                passengers: null,
                routesComponents: [],
                routes: [],
                rentals: [],
                errorMessage: '',
                error: false,
                errorCountdown: 0,
                errorDismissSecs: 5,
                resultDisplay: 'none',
                bookingDisplay: 'none',
                planClass: 'block',
                isSubmit: false,
                isBooking: false,
                isTour: false,
            }
        },

        created: function(){
            this.addRoute('a-1');
            const routeComponent = {
                id: "r-" + (this.routesComponents.length + 1),
                component: 'route-form',
                title: "Tappa #" + (this.routesComponents.length + 1),
                hasArrival: false
            }
            this.routesComponents.push(routeComponent);
            this.addRoute(routeComponent.id);
        },

        methods: {
            addRouteComponent: function(){
                if(!this.checkForm()){
                    return;
                }
                const routeComponent = {
                    id: "r-" + (this.routesComponents.length + 1),
                    component: 'route-form',
                    title: "Tappa #" + (this.routesComponents.length + 1),
                    hasArrival: false,
                }
                this.routesComponents.push(routeComponent);
                this.addRoute(routeComponent.id);
            },

            addRoute: function(id){
                this.routes.push({
                    id: id,
                    isReturn: false,
                    isPrevReturn: false
                });

                if(this.routes.length > 2 && this.routes[this.routes.length - 2].isReturn){
                    this.routes[this.routes.length - 1].isPrevReturn = true;
                }
            },

            removeRouteComponent: function(){
                this.routesComponents.pop();
                this.routes.pop();
                this.routes[this.routes.length - 1].departure = null;
            },

            onChangeLocation: function(location, route){
                const routeIndex = this.routes.findIndex(r => r.id === route);
                if(routeIndex !== undefined){
                    this.routes[routeIndex].loc = location;
                }

                let countReadyRoutes = 0;
                for(let route of this.routes){
                    if(!(route.loc === undefined || route.loc === null || Object.keys(route.loc).length === 0)){
                        countReadyRoutes++
                    }
                }
                
                if(countReadyRoutes >= 2){
                    this.$emit('form:have-a-route', routeIndex - 1, routeIndex);
                }
            },

            onChangeDate: function(date, route){
                const routeIndex = this.routes.findIndex(r => r.id === route);
                if(routeIndex !== undefined){
                    this.routes[routeIndex].departure = date.format('YYYY-MM-DD HH:mm');
                    this.$emit('form:have-a-route', routeIndex, routeIndex + 1);
                }
            },

            onReturn: function(route, autocomplete){
                const goingRouteIndex = 0;
                const routeIndex = this.routes.findIndex(r => r.id === route);
                if(routeIndex !== undefined){
                    this.routes[routeIndex].loc = Object.assign(this.routes[goingRouteIndex].loc, {});
                    this.routes[routeIndex].isReturn = true;
                    document.getElementById(autocomplete).value = this.routes[routeIndex].loc.address;
                    this.$emit('form:have-a-route', routeIndex - 1, routeIndex);
                }
            },

            onResultClose: function(){
                this.resultDisplay = 'none';
                this.close();
            },

            onBookingClose: function(){
                this.bookingDisplay = 'none';
                this.close();
            },

            close: function(){
                this.planClass = 'block';
                this.routesComponents = [];
                this.routes = [];
                this.isSubmit = false;
                this.addRoute('a-1');
                const routeComponent = {
                    id: "r-" + (this.routesComponents.length + 1),
                    component: 'route-form',
                    title: "Tappa #" + (this.routesComponents.length + 1),
                    hasArrival: false
                }
                this.routesComponents.push(routeComponent);
                this.addRoute(routeComponent.id);
                this.passengers = '';
                this.$radio.$emit('form:clear');
            },

            onReturnModalOk: function(){
                this.$refs.setReturnModal.hide();
                const routeComponent = {
                    id: "r-" + (this.routesComponents.length + 1),
                    component: 'route-form',
                    title: "Tappa #" + (this.routesComponents.length + 1),
                    hasArrival: false,
                }
                this.routesComponents.push(routeComponent);
                this.addRoute(routeComponent.id);
                this.$nextTick(() => {
                    const addedRoute = this.routes[this.routes.length - 1];
                    addedRoute.loc = Object.assign(this.routes[0].loc, {});
                    addedRoute.isReturn = true;
                    document.getElementById('ac-' + addedRoute.id).value = this.routes[0].loc.address;
                    this.$emit('form:have-a-route', this.routes.length - 2, this.routes.length - 1);
                });
            },

            onReturnModalCancel: function(){
                this.$refs.setReturnModal.hide();
                this.isTour = false;
                this.submit(true);
            },

            checkForm: function(){
                if(this.routes.length < 2){
                    this.error = true;
                    this.errorCountdown = this.errorDismissSecs;
                    this.errorMessage = 'Controlla che il form sia compilato correttamente';
                    return false;
                }

                for(let i = 0; i < this.routes.length; i++){
                    const route = this.routes[i];
                    if(route.loc === undefined || route.loc === null || Object.keys(route.loc).length === 0){
                        this.error = true;
                        this.errorCountdown = this.errorDismissSecs;
                        this.errorMessage = 'Controlla che il form sia compilato correttamente: errore location';
                        return false;
                    }

                    if(i < this.routes.length - 1){
                        if(route.departure === undefined || route.departure === null || route.departure === ''){
                            this.error = true;
                            this.errorCountdown = this.errorDismissSecs;
                            this.errorMessage = 'Controlla che il form sia compilato correttamente: errore data';
                            return false;
                        }
                    }
                }

                return true;
            },

            errorCountdownChange: function(countDown){
                this.errorCountdown = countDown;
            },

            getRoute: function(index){
                if(this.routes[index] !== undefined){
                    return this.routes[index];
                }

                return null;
            },

            submit: function(skip=false){
                if(!this.checkForm()){
                    return false;
                }

                if(this.passengers === null || this.passengers === ''){
                    this.error = true;
                    this.errorCountdown = this.errorDismissSecs;
                    this.errorMessage = 'Inserisci il numero dei passeggeri';
                    return false;
                }
                
                if(!skip && this.isTour && this.routes.length < 3){
                   this.$refs.setReturnModal.show();
                   return false;
                }else if(!skip){
                    const start = this.routes[0];
                    const end = this.routes[this.routes.length - 1];
                    if(start.loc.address !== end.loc.address){
                        this.$refs.setReturnModal.show();
                        return false;
                    }
                }

                this.isSubmit = true;
                this.planClass = 'none';
                this.resultDisplay = 'fixed';
            },

            onBooking: function(rentals){
                this.rentals = rentals;
                this.resultDisplay = 'none';
                this.bookingDisplay = 'fixed';
                this.isBooking = true;
            }
        },

        googleMapsReady: function(){
            this.$on('form:have-a-route', (startIndex, endIndex) => {
                if(startIndex < 0 || endIndex >= this.routes.length){
                    return;
                }

                const ds = new google.maps.DirectionsService;
                const startRoute = this.routes[startIndex]; // ex routeOne 
                let endRoute = this.routes[endIndex]; // ex endRoute
                
                if(endRoute.loc === undefined){
                    return;
                }

                if(!(startRoute.departure === undefined || startRoute.departure === null || startRoute.departure === '')){
                    ds.route({
                        origin: startRoute.loc,
                        destination: endRoute.loc,
                        travelMode: 'DRIVING'
                    }, (response, status) => {
                        const legs = response.routes[0].legs[0];
                        const tmpArrival = moment(startRoute.departure);
                        tmpArrival.add(legs.duration.value, 'seconds');
                        const arrival = DateTimeHandler.floorTimeToQuarter(tmpArrival);
                        endRoute.arrival = arrival.format("YYYY-MM-DD HH:mm");
                        endRoute.duration = DateTimeHandler.getDurationDiff(startRoute.departure, arrival);
                        endRoute.distance = legs.distance.value;
                        this.routesComponents[endIndex - 1].hasArrival = true;
                    });
                }
            });
        }
    }
</script>