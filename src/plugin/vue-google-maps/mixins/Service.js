import Ready from './Ready';

export default {
    mixins: [Ready],

    props: {
        filter: {
            type: Function,
            default: null
        },
        request: {
            type: Object,
            default: null
        },
        tag: {
            type: String,
            default: 'div'
        }
    },

    data: function(){
        return {
            loading: false,
            results: null,
            status: null
        }
    },

    computed: {
        filteredResults: function(){
            if(this.results && this.filter){
                return this.results.filter(this.filter)
            }else{
                return this.results
            }
        },

        finalResults: function(){
            const results = this.filteredResults;
            return results && (!Array.isArray(results) || results.length) ? results : null;
        }
    },

    watch: {
        request: {
            handler: function(value){
                value && this.update()
            },
            deep: true
        },

        finalResults: function(value){
            this.$emit('results', value);
        }
    },

    methods: {
        createServices: function(){
            // Override this in components
        },

        getScope: function(){
            // Override this in components
            return {
                loading: this.loading,
                results: this.results,
                status: this.status
            }
        },

        setResults: function(results, status){
            this.results = results;
            this.status = status;
        },

        update: function(){
            // Override this in components
        }
    },

    googleMapsReady: function() {
        this.createServices();
        this.request && this.update();
    },

    render: function(h){
        return h(this.tag, [
            this.$scopedSlots.default && this.scopedSlots.default(this.getScope()),
            h('span', {
                ref: 'attibutions'
            })
        ]);
    }
}