<template>
    <b-card :header="title" class="mb-2" :id="id">
        <b-container fluid>
            <b-row>
                <b-col>
                    <b-form-group label="Da:">
                        <google-maps-autocomplete
                                :id="autocompleteId"
                                class="form-control app-form-address-search"
                                country="it"
                                :types="$app.configs.form.autocompleteTypes"
                                placeholder="Indirizzo, hotel, destinazione..."
                                ref="googleMapsAutocomplete"
                                v-on:gmaps:autocomplete:place-changed="onChangeLocationFrom"
                        >
                        </google-maps-autocomplete>
                        <div slot="description">
                            <template v-if="hasArrival">
                                <i class="fa fa-calendar"></i> 
                                Arrivo previsto: {{ getArrivalDate(route.arrival) }} ({{ getRouteDuration(route.duration) }} di viaggio)
                            </template>
                        </div>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="A:">
                        <google-maps-autocomplete
                                :id="autocompleteId"
                                class="form-control app-form-address-search"
                                country="it"
                                :types="$app.configs.form.autocompleteTypes"
                                placeholder="Indirizzo, hotel, destinazione..."
                                ref="googleMapsAutocomplete"
                                v-on:gmaps:autocomplete:place-changed="onChangeLocationTo"
                        >
                        </google-maps-autocomplete>
                        <div slot="description">
                            <template v-if="hasArrival">
                                <i class="fa fa-calendar"></i> 
                                Arrivo previsto: {{ getArrivalDate(route.arrival) }} ({{ getRouteDuration(route.duration) }} di viaggio)
                            </template>
                        </div>
                    </b-form-group>
                </b-col>
                <b-col v-if="isLast && count > 1 && !route.isReturn && !route.isPrevReturn">
                    <b-form-group label="">
                        <b-button size="lg" variant="primary" @click.prevent="onReturnClick">Ritorna al punto di partenza</b-button>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row v-if="!isLast">
                <b-col>
                    <b-form-group label="Che giorno vuoi partire?">
                        <datepicker input-class="form-control" :id="datepickerId" v-on:selected="onDateSelected" :disabled="disabledDate"></datepicker>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="A che ora?">
                        <b-form-select v-model="timeSelected" :options="timeOptions" @change="onTimeChange"></b-form-select>
                        <div slot="description">
                            <template v-if="hasArrival && stopDuration !== ''">
                                <i class="fa fa-clock-o"></i> Sosta: {{ stopDuration }}
                            </template>
                        </div>
                    </b-form-group>
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

    components: {
        Datepicker
    },

    props: ['id', 'title', 'isLast', 'count', 'route', 'hasArrival'],

    data: function(){
        return {
            loc: null,
            date: moment(),
            timeSelected: null,
            stopDuration: '',
            timeOptions: DateTimeHandler.getTimeOptions()
        }
    },

    created: function(){
        this.$radio.$on('form:clear', () => {
            this.loc = null;
            this.date = moment();
            this.timeSelected = null;
            this.stopDuration = '';
            this.timeOptions = DateTimeHandler.getTimeOptions();
            const autocomplete = document.getElementById(this.autocompleteId);
            if(autocomplete !== null){
                autocomplete.value = '';
            }
            const datepicker = document.getElementById(this.datepickerId);
            if(datepicker !== null){
                datepicker.value = '';
            }
        });
    },

    computed: {

        disabledDate: function(){
            if(this.hasArrival){
                const arrivalDate = moment(this.route.arrival);
                return {
                    to: arrivalDate.subtract(1, 'd').toDate()
                };
            }

            const disabledConfig = this.$app.configs.form.disabledDate;
            return {
                to: moment().add(disabledConfig[0], disabledConfig[1]).toDate()
            };
            
        },

        autocompleteId: function(){
            return "ac-" + this.id;
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
            this.$emit('route:changelocationto', loc);
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
            const arrivalTime = moment(this.route.arrival);
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
                if(!this.hasArrival){
                    this.timeSelected = this.selectNowTime(); 
                }else{
                    this.timeSelected = this.selectArrivalTime();
                    compareDateForTime = moment(this.route.arrival);
                }
                this.date.set('hour', this.timeSelected.h);
                this.date.set('minute', this.timeSelected.m);
                this.timeOptions = DateTimeHandler.getTimeOptionsFromDate(this.date, compareDateForTime);
            }

            if(this.hasArrival){
                this.stopDuration = DateTimeHandler.getDurationString(
                    DateTimeHandler.getDurationDiff(moment(this.route.arrival), this.date)
                );
            }

            this.$emit('route:changedate', moment(this.date), this.id);
        },

        onTimeChange: function(time){
            this.date.set('hour', time.h);
            this.date.set('minute', time.m);

            if(this.hasArrival){
                this.stopDuration = DateTimeHandler.getDurationString(
                    DateTimeHandler.getDurationDiff(moment(this.route.arrival), this.date)
                );
            }

            this.$emit('route:changedate', moment(this.date), this.id);
        },

        onReturnClick: function(){
            this.$emit('route:return', this.id, this.autocompleteId);
        },

        getArrivalDate: function(date){
            return moment(date).format(this.$app.configs.moment_datetime_format);
        },

        getRouteDuration(duration){
            return DateTimeHandler.getDurationString(duration);
        }
    }
    
}
</script>

<style>

</style>
