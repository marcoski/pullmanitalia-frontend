<template>
    <b-card :header="title" class="mb-2" :id="id">
        <b-container fluid>
            <b-row>
                <b-col>
                    <b-form-group label="Da:">
                        <google-maps-autocomplete
                                :id="autocompleteIdFrom"
                                class="form-control app-form-address-search"
                                country="it"
                                :types="$app.configs.form.autocompleteTypes"
                                placeholder="Indirizzo, hotel, destinazione..."
                                ref="googleMapsAutocomplete"
                                v-on:gmaps:autocomplete:place-changed="onChangeLocationFrom"
                        >
                        </google-maps-autocomplete>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="A:">
                        <b-input-group>
                            <google-maps-autocomplete
                                :id="autocompleteIdTo"
                                class="form-control app-form-address-search"
                                country="it"
                                :types="$app.configs.form.autocompleteTypes"
                                placeholder="Indirizzo, hotel, destinazione..."
                                ref="googleMapsAutocomplete"
                                v-on:gmaps:autocomplete:place-changed="onChangeLocationTo"
                            >
                            </google-maps-autocomplete>
                            <b-input-group-append v-if="isLast && count > 1 && !route.isReturn">
                                <b-btn variant="primary" @click.prevent="onReturnClick">Ritorna al punto di partenza</b-btn>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-form-group label="Che giorno vuoi partire?">
                        <datepicker input-class="form-control" :id="datepickerId" v-on:selected="onDateSelected" :disabled="disabledDate"></datepicker>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="A che ora?">
                        <b-form-select v-model="timeSelected" :options="timeOptions" @change="onTimeChange"></b-form-select>
                        <div slot="description">
                            <template v-if="route.arrival !== null && stopDuration !== ''">
                                <i class="fa fa-clock-o"></i> Sosta: {{ stopDuration }}
                            </template>
                        </div>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row v-if="route.arrival !== null">
                <b-col>
                    <b-alert show variant="success">
                        <b-row>
                            <b-col cols="6">
                                <i class="fa fa-calendar"></i> 
                                Arrivo previsto: {{ getArrivalDate(route.arrival) }} ({{ getRouteDuration(route.duration) }} di viaggio)
                            </b-col>
                            <b-col cols="6">
                                <i class="icon icon-map"></i>
                                Distanza: {{ (route.distance / 1000).toFixed(2) }} Km
                            </b-col>
                        </b-row>
                    </b-alert>
                </b-col>
            </b-row>
        </b-container> 
    </b-card>
</template>

<script>
    
    import DateTimeHandler from '../classes/DateTimeHandler';
    import Datepicker from 'vuejs-datepicker';
    import moment from 'moment';
    
    export default {
        name: 'route-form',

        props: ['id', 'title', 'route', 'hasArrival', 'count', 'isLast', 'isTour'],

        components: {
            Datepicker
        },

        data: function(){
            return {
                date: moment(),
                timeSelected: null,
                stopDuration: '',
                timeOptions: DateTimeHandler.getTimeOptions()
            }
        },

        computed: {
            disabledDate: function(){
                if(this.isTimeDependant()){
                    const arrivalDate = moment(this.route.prev.arrival);
                    return {
                        to: arrivalDate.subtract(1, 'd').toDate()
                    };
                }

                const disabledConfig = this.$app.configs.form.disabledDate;
                return {
                    to: moment().add(disabledConfig[0], disabledConfig[1]).toDate()
                };
                
            },

            autocompleteIdFrom: function(){
                return "from-" + this.id;
            },

            autocompleteIdTo: function(){
                return "to-" + this.id;
            },

            datepickerId: function(){
                return "dp-" + this.id;
            }
        },

        methods: {
            onChangeLocationFrom: function(location, place, id){
                const loc = {
                    lat: location.latitude,
                    lng: location.longitude,
                    address: document.getElementById(id).value,
                    locality: location.locality
                }
                this.$emit('route:changelocationfrom', loc, this.id);
            },

            onChangeLocationTo: function(location, place, id){
                const loc = {
                    lat: location.latitude,
                    lng: location.longitude,
                    address: document.getElementById(id).value,
                    locality: location.locality
                }
                this.$emit('route:changelocationto', loc, this.id);
            },

            selectNowTime: function(){
                let selectDate = DateTimeHandler.ceilTimeToQuarter(
                    moment(),
                    moment()
                );
                return this.selectTime(selectDate.format('HH'), selectDate.format('mm'));
            },

            selectArrivalTime: function(){
                const stopConfig = this.$app.configs.form.stopTime;
                const arrivalTime = moment(this.route.prev.arrival);
                arrivalTime.add(stopConfig[0], stopConfig[1]);
                let selectDate = DateTimeHandler.ceilTimeToQuarter(
                    arrivalTime,
                    moment(),
                );
                return this.selectTime(selectDate.format('HH'), selectDate.format('mm'));
            },

            selectTime: function(hh, mm){
                const selected = this.timeOptions.find((t) => {
                    return (t.value.h == hh && t.value.m == mm);
                });

                return selected.value;
            },

            onDateSelected: function(date){
                let selected = moment(date);
                this.date.set('year', selected.format('YYYY'));
                this.date.set('month', selected.format('M') - 1);
                this.date.set('date', selected.format('D'));
                if(this.timeSelected === null){
                    let compareDateForTime = moment();
                    if(this.isTimeDependant()){
                        this.timeSelected = this.selectArrivalTime();
                        compareDateForTime = moment(this.route.prev.arrival); 
                    }else{
                        this.timeSelected = this.selectNowTime();
                    }
                    this.date.set('hour', this.timeSelected.h);
                    this.date.set('minute', this.timeSelected.m);
                    this.timeOptions = DateTimeHandler.getTimeOptionsFromDate(this.date, compareDateForTime);
                }

                if(this.isTimeDependant()){
                    this.stopDuration = DateTimeHandler.getDurationString(
                        DateTimeHandler.getDurationDiff(moment(this.route.arrival), this.date)
                    );
                }

                this.$emit('route:changedate', moment(this.date), this.id);
            },

            onTimeChange: function(time){
                this.date.set('hour', time.h);
                this.date.set('minute', time.m);

                if(this.isTimeDependant()){
                    this.stopDuration = DateTimeHandler.getDurationString(
                        DateTimeHandler.getDurationDiff(moment(this.route.arrival), this.date)
                    );
                }

                this.$emit('route:changedate', moment(this.date), this.id);
            },

            getArrivalDate: function(date){
                return moment(date).format(this.$app.configs.moment_datetime_format);
            },

            getRouteDuration(duration){
                return DateTimeHandler.getDurationString(duration);
            },

            onReturnClick: function(){
                this.$emit('route:return', this.id, this.autocompleteIdTo);
            },

            isTimeDependant: function(){
                return (
                    this.route.prev !== null &&
                    (this.isTour || this.route.prev.to.address === this.route.from.address) &&
                    this.route.prev.arrival !== null
                );
            }
        }
    }
</script>
