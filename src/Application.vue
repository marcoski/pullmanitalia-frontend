<template>
    <b-container>
        <section class="plan-container">
            <div class="plan-content">
                <h3>Inizia il tuo viaggio</h3>
                <b-form>
                    <b-row>
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
                            <b-form-group label="Numero di partecipanti" description="Puoi inserire anche un numero indicativo">
                                <b-form-input type="text" v-model="passenger"></b-form-input>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-button size="lg" variant="primary" @click.prevent="submit">
                                <i class="fa fa-search"></i>
                                Cerca
                            </b-button>
                        </b-col>
                    </b-row>
                </b-form>
            </div>
        </section>
    </b-container>
</template>

<script>
    import RouteForm from './components/RouteForm';
    import DateTimeHandler from './classes/DateTimeHandler';
    import Ready from './plugin/vue-google-maps/mixins/Ready';
    import moment from 'moment';

    export default {
        name: 'app',

        components: {
            RouteForm
        },

        mixins: [
            Ready
        ],

        data: function(){
            return {
                passenger: null,
                routesComponents: [],
                routes: [],
                errorMessage: '',
                error: false,
                errorCountdown: 0,
                errorDismissSecs: 5
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
                    this.$emit('form:have-a-route');
                }
            },

            onChangeDate: function(date, route){
                const routeIndex = this.routes.findIndex(r => r.id === route);
                if(routeIndex !== undefined){
                    this.routes[routeIndex].departure = date.format('YYYY-MM-DD HH:mm');
                }
            },

            onReturn: function(route, autocomplete){
                const goingRouteIndex = 0;
                const routeIndex = this.routes.findIndex(r => r.id === route);
                if(routeIndex !== undefined){
                    this.routes[routeIndex].loc = Object.assign(this.routes[goingRouteIndex].loc, {});
                    this.routes[routeIndex].isReturn = true;
                    document.getElementById(autocomplete).value = this.routes[routeIndex].loc.address;
                    this.$emit('form:have-a-route');
                }
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

            submit: function(){
                if(!this.checkForm()){
                    return false;
                }

                if(this.passenger === null || this.passenger === ''){
                    this.error = true;
                    this.errorCountdown = this.errorDismissSecs;
                    this.errorMessage = 'Inserisci il numero dei passeggeri';
                    return false;
                }

                console.log(JSON.parse(JSON.stringify(this.routes)), this.passenger);
            }
        },

        googleMapsReady: function(){
            this.$on('form:have-a-route', () => {
                const ds = new google.maps.DirectionsService;
                const routeOne = this.routes[this.routes.length - 2];
                let routeTwo = this.routes[this.routes.length - 1];
                if(!(routeOne.departure === undefined || routeOne.departure === null || routeOne.departure === '')){
                    ds.route({
                        origin: routeOne.loc,
                        destination: routeTwo.loc,
                        travelMode: 'DRIVING'
                    }, (response, status) => {
                        const legs = response.routes[0].legs[0];
                        const tmpArrival = moment(routeOne.departure);
                        tmpArrival.add(legs.duration.value, 'seconds');
                        const arrival = DateTimeHandler.floorTimeToQuarter(tmpArrival);
                        routeTwo.arrival = arrival.format("YYYY-MM-DD HH:mm");
                        routeTwo.duration = DateTimeHandler.getDurationDiff(routeOne.departure, arrival);
                        routeTwo.distance = legs.distance.value;
                        this.routesComponents[this.routesComponents.length-1].hasArrival = true;
                    });
                }
            });
        }
    }
</script>