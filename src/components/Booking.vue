<template>
    <section class="booking-container">
        <header class="modal-header">
            <h5 class="modal-title">Risultati ricerca</h5>
            <button type="button" class="close" @click.prevent="close">x</button>
        </header>
        <b-container fluid>
            <b-row>
                <b-col>
                    <pre>
                        <code>{{ booking }}</code>
                    </pre>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import VoucherGenerator from '../classes/VoucherGenerator';
    import moment from 'moment';

    export default {
        name: 'booking',

        props: ['rentals'],

        data: function(){
            return {
                booking: this.generateBooking()
            }
        },

        methods: {
            close: function(){
                this.$emit('close');
            },

            generateBooking: function(){
                const generator = new VoucherGenerator();
                const bookingCode = generator.generate();
                const rentals = this.rentals.map((r) => {
                    r.code = bookingCode;
                    return r;
                });

                return {
                    code: bookingCode,
                    confirmed: false,
                    eInvoice: false,
                    schoolService: false,
                    openDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                    rentals: rentals,
                    customer: null,
                    note: null
                }
            }
        }
    }
</script>
