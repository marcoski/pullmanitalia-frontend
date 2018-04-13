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
                                            <label class="custom-control material-checkbox">
                                                <input type="checkbox" v-model="isTour" class="material-control-input">
                                                <span class="material-control-indicator"></span>
                                                <span class="material-control-description">Vuoi il pullman sempre a disposizione?</span>
                                            </label>
                                        </b-col>
                                    </b-row>
                                </b-card>
                            </b-col>
                        </b-row>
                        <b-row class="mt-2 mb-2">
                            <b-col>
                                <route-form v-for="(route, index) of routes.toArray()"
                                    :key="index"
                                    :id="route.id" 
                                    :title="route.component.title"
                                    :route="route"
                                    :count="routes.count()"
                                    :isLast="routes.isLast(r => r.id === route.id)"
                                    :isTour="isTour"
                                    @route:changelocationfrom="onChangeLocationFrom"
                                    @route:changelocationto="onChangeLocationTo"
                                    @route:changedate="onChangeDate"
                                    @route:return="onReturn"
                                ></route-form>
                            </b-col>
                        </b-row>
                        <b-row class="mt-2 mb-2">
                            <b-col>
                                <b-button-group>
                                    <b-button size="md" variant="primary" @click.prevent="addNewRoute">
                                        <i class="fa fa-plus"></i> Aggiungi tappa / ritorno
                                    </b-button>
                                    <b-button v-if="routes.count() > 1" size="md" variant="warning" @click.prevent="removeRoute">
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
                routes: new RouteList(),
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
            this.addRoute();
        },

        methods: {
            addRoute: function(){
                const route = new Route(
                    'r-' + this.routes.count(), 
                    {}, { title: "Tappa #" + (this.routes.count() + 1)}
                );

                this.routes.add(route);
            },

            removeRoute: function(){
                this.routes.pop();
            },

            addNewRoute: function(){
                const pre = this.routes.getLast();
                this.addRoute();
                const last = this.routes.getLast();
                if(pre !== null && pre.to !== null){
                    last.from = pre.to;
                    this.$nextTick(() => {
                        document.getElementById("from-" + last.id).value = pre.to.address;
                    });
                }
            },

            onReturnModalOk: function(){
                this.$refs.setReturnModal.hide();
                const pre = this.routes.getLast();
                this.addRoute();
                const last = this.routes.getLast();
                last.isReturn = true;
                if(pre !== null && pre.to !== null){
                    last.from = pre.to;
                    this.$nextTick(() => {
                        document.getElementById("from-" + last.id).value = pre.to.address;
                    });
                }

                if(pre !== null && pre.from !== null){
                    last.to = pre.from;
                    this.$nextTick(() => {
                        document.getElementById("to-" + last.id).value = pre.from.address;
                    })
                }
            },

            onReturnModalCancel: function(){
                this.$refs.setReturnModal.hide();
                this.isTour = false;
                this.submit(true);
            },

            onChangeLocationFrom: function(location, route){
                const r = this.routes.find(r => r.id === route);
                if(r !== null){
                    r.from = location;
                }
            },

            onChangeLocationTo: function(location, route){
                const r = this.routes.find(r => r.id === route);
                if(r !== null){
                    if(r.to === null){
                        r.to = location
                    }
                    this.$emit('form:have-a-route', r);
                }
            },

            onChangeDate: function(date, route){
                const r = this.routes.find(r => r.id === route);
                if(r !== null){
                    r.departure = date.format('YYYY-MM-DD HH:mm');
                    this.$emit('form:have-a-route', r);
                }
            },

            onReturn: function(route, autocomplete){
                const goingRoute = this.routes.getFirst();
                const r = this.routes.find(r => r.id === route);
                if(r !== undefined){
                    r.to = Object.assign(goingRoute.from, {});
                    r.isReturn = true;
                    document.getElementById(autocomplete).value = r.to.address;
                    this.$emit('form:have-a-route', r);
                }
            },

            submit: function(skip=false){
                if(!this.validForm()){
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
                    const start = this.routes.getFirst();
                    const end = this.routes.getLast();
                    if(start.from.address !== end.to.address){
                        this.$refs.setReturnModal.show();
                        return false;
                    }
                }

                this.isSubmit = true;
                this.planClass = 'none';
                this.resultDisplay = 'fixed';
            },

            errorCountdownChange: function(countDown){
                this.errorCountdown = countDown;
            },

            validForm: function(){
                const routes = this.routes.toArray();
                for(let i = 0; i < routes.length; i++){
                    const route = routes[i];
                    if(route.to === null || route.from === null){
                        this.error = true;
                        this.errorCountdown = this.errorDismissSecs;
                        this.errorMessage = 'Controlla che il form sia compilato correttamente: errore location';
                        return false;
                    }

                    if(route.departure === null){
                        this.error = true;
                        this.errorCountdown = this.errorDismissSecs;
                        this.errorMessage = 'Controlla che il form sia compilato correttamente: errore data';
                        return false;
                    }
                }

                return true;
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
                this.routes = new RouteList();
                this.isSubmit = false;
                this.addRoute();
                this.passengers = '';
                this.$radio.$emit('form:clear');
            },

            onBooking: function(rentals){
                this.rentals = rentals;
                this.resultDisplay = 'none';
                this.bookingDisplay = 'fixed';
                this.isBooking = true;
            }
        },

        googleMapsReady: function(){
            this.$on('form:have-a-route', (route) => {
                if(route.to === null){
                    return;
                }

                const ds = new google.maps.DirectionsService;
                if(!(route.departure === undefined || route.departure === null || route.departure === '')){
                    ds.route({
                        origin: route.from,
                        destination: route.to,
                        travelMode: 'DRIVING'
                    }, (response, status) => {
                        const legs = response.routes[0].legs[0];
                        const tmpArrival = moment(route.departure);
                        tmpArrival.add(legs.duration.value, 'seconds');
                        const arrival = DateTimeHandler.floorTimeToQuarter(tmpArrival);
                        route.arrival = arrival.format("YYYY-MM-DD HH:mm");
                        route.duration = DateTimeHandler.getDurationDiff(route.departure, arrival);
                        route.distance = legs.distance.value;
                    });
                }
            });
        }
    }
</script>
