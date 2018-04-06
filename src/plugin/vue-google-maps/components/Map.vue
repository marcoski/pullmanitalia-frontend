<template>
    <div class="google-maps">
        <div ref="map" class="map-view"></div>
        <div class="hidden-content">
            <slot></slot>
        </div>
        <resize-observer @notify="resize"></resize-observer>
    </div>
</template>

<script>

import Ready from "../mixins/Ready";
import BoundProps from "../mixins/BoundProps";
import Events from "../mixins/Events";
import { autoCall } from "../util/misc";
import { redirectMethods } from "../util/redirectmethods"
import { getZoomByBounds } from "../util/misc";

const boundProps = [
    {
        name: 'center',
        watcher: value => ({
            lat: autoCall(value.lat),
            lng: autoCall(value.lng)
        }),
        identity: (a, b) => {
            if(a && b){
                if(typeof a.equals !== 'function'){
                    a = new window.google.maps.LatLng(a);
                }
                if(typeof b.equals !== 'function'){
                    b = new window.google.maps.LatLng(b);
                }
                return a.equals(b);
            }
        },
        retriever: (value) => ({
            lat: value.lat(),
            lng: value.lng()
        })
    },
    'heading',
    'mapTypeId',
    'tilt',
    'zoom'
];

const redirectedMethods = [
    'panBy',
    'panTo',
    'panToBounds',
    'fitToBounds',
    'getBounds'
];

const redirectedEvents = [
    'click',
    'dblclick',
    'drag',
    'dragend',
    'dragstart',
    'mousemove',
    'mouseout',
    'resize',
    'rightclick',
    'tilesloaded'
];

export default {
    name: 'google-maps-map',
    mixins: [
        Ready,
        BoundProps,
        Events
    ],

    props: {
        center: {
            type: Object
        },
        heading: {
            type: Number
        },
        mapTypeId: {
            type: String
        },
        options: {
            type: Object,
            default: () => ({})
        },
        tilt: {
            type: Number
        },
        zoom: {
            required: true,
            type: Number
        },
        bounds: {
            type: Array,
            default: []
        }
    },

    beforeCreate: function(){
        this.$_mapPromises = [];
    },

    googleMapsReady: function(){
        const element = this.$refs.map;

        const options = {
            heading: this.heading,
            mapTypeId: this.mapTypeId,
            tilt: this.tilt,
            zoom: this.zoom,
            ...this.options
        }
        
        this.$_map = new window.google.maps.Map(element, options);
        if(this.bounds.length === 0){
            this.$_map.setCenter(this.center);
        }else{
            var latLngBounds = new google.maps.LatLngBounds();
            for(const bound of this.bounds){
                latLngBounds.extend(bound);
            }

            this.$_map.setCenter(latLngBounds.getCenter());
            this.listen(this.$_map, 'resize', () => {
                this.$_map.setZoom(getZoomByBounds(this.$_map, latLngBounds));
            });
        }

        this.bindProps(this.$_map, boundProps);

        this.listen(this.$_map, 'bounds_changed', () => {
            this.$emit('update:bounds', this.$_map.getBounds())
        });

        this.listen(this.$_map, 'idle', () => {
            this.$emit('idle', this);
            this.lastCenter = this.$_map.getCenter();
        });

        this.lastCenter = this.$_map.getCenter();

        this.redirectEvents(this.$_map, redirectedEvents);

        this.$_mapPromises.forEach(resolve => resolve(this.$_map));
    },

    methods:{
        ...redirectMethods({
            target(){
                return this.$_map;
            },
            names: redirectedMethods
        }),

        resize: function(){
            if(this.$_map){
                window.google.maps.event.trigger(this.$_map, 'resize');
            }
        },

        $_getMap: function(){
            if(this.$_map){
                return Promise.resolve(this.$_map);
            }else{
                return new Promise(resolve => {
                    this.$_mapPromises.push(resolve)
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.google-maps{
    position: relative;

    .map-view{
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        position: absolute;
    }

    .hidden-content{
        display: none;
    }
}
</style>
