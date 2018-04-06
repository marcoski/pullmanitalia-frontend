<template>
    <input
            ref="googleMapsAutocomplete"
            type="text"
            :class="classname"
            :id="id"
            :placeholder="placeholder"
            v-model="autocompleteText"
            @focus="onFocus()"
            @blur="onBlur()"
            @change="onChange()"
            @keypress="onKeyPress()"
            @keyup="onKeyUp()"
    />
</template>
<script>
    import Ready from "../mixins/Ready";

    export default{
        name: 'google-maps-autocomplete',

        mixins: [
            Ready
        ],

        props: {
            id: {
                type: String,
                required: true
            },
            classname: String,
            placeholder: String,
            types: {
                type: String,
                default: 'address'
            },
            country: {
                type: [String, Array],
                default: null
            },
            enableGeolocation: {
                type: Boolean,
                default: false
            }
        },

        data: function(){
            return {
                /**
                 * The Autocomplete Object
                 * @type {Autocomplete}
                 * @link https://developers.google.com/maps/documentation/javascript/reference#Autocomplete
                 */
                autocomplete: null,
                autocompleteText: ''
            }
        },

        watch: {
            autocompleteText: function(newVal, oldVal){
                this.$emit('gmaps:autocomplete:input-change', {newVal, oldVal}, this.id);
            },

            country: function(newVal, oldVal){
                this.autocomplete.setComponentRestrictions({
                    country: this.country === null ? [] : this.country
                });
            }
        },

        googleMapsReady: function(){
            const options = {};

            if(this.types){
                options.types = [this.types];
            }

            if(this.country){
                options.componentRestrictions = {
                    country: this.country
                };
            }

            this.autocomplete = new window.google.maps.places.Autocomplete(
                document.getElementById(this.id),
                options
            );

            this.autocomplete.addListener('place_changed', () => {
                let place = this.autocomplete.getPlace();
                if(!place.geometry){
                    this.$emit('gmaps:autocomplete:no-result-found', place, this.id);
                    return;
                }

                let addressComponents = {
                    street_number: 'short_name',
                    route: 'long_name',
                    locality: 'long_name',
                    administrative_area_level_1: 'short_name',
                    administrative_area_level_2: 'short_name',
                    country: 'long_name',
                    postal_code: 'short_name'
                };

                let returnData = {};

                if(place.address_components !== 'undefined'){
                    for(let i = 0; i < place.address_components.length; i++){
                        let addressType = place.address_components[i].types[0];

                        if(addressComponents[addressType]){
                            let val = place.address_components[i][addressComponents[addressType]];
                            returnData[addressType] = val;
                        }
                    }

                    returnData['latitude'] = place.geometry.location.lat();
                    returnData['longitude'] = place.geometry.location.lng();
                    this.$emit('gmaps:autocomplete:place-changed', returnData, place, this.id);

                    this.autocompleteText = document.getElementById(this.id).value;
                    this.onChange();
                }
            });
        },

        methods: {
            onFocus: function(){
                this.geolocate();
                this.$emit('gmaps:autocomplete:focus');
            },

            onBlur: function(){
                this.$emit('gmaps:autocomplete:blur');
            },

            onChange: function(){
                this.$emit('gmaps:autocomplete:change', this.autocompleteText);
            },

             onKeyPress: function(event){
                this.$emit('gmaps:autocomplete:keypress', event);
             },

            onKeyUp: function(event){
                 this.$emit('gmaps:autocomplete:keyup', event);
            },

            clear: function(){
                this.autocompleteText = '';
            },

            focus: function(){
                this.$refs.autocomplete.focus();
            },

            blur: function(){
                this.$refs.autocomplete.blur();
            },

            update: function(value){
                this.autocompleteText = value;
            },

            geolocate: function(){
                if(this.enableGeolocation){
                    if(navigator.geolocation){
                        navigator.geolocation.getCurrentPosition(position => {
                           let geolocation = {
                               lat: position.coords.latitude,
                               lng: position.coords.longitude
                           };

                           let circle = new window.google.maps.Circle({
                               center: geolocation,
                               radius: position.coords.accuracy
                           });

                           this.autocomplete.setBounds(circle.getBounds());
                        });
                    }
                }
            }
        }
    }
</script>