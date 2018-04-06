import moment from 'moment';

export default class Event{

    constructor(route, color){
        this.prev = null;
        this.next = null;
        this.color = color;
        this.dirty = false;
        this.id = route.id;
        this.note = route.note;
        this.rental = route.rental;
        this.rental.color = color;
        this.loc = route.loc;
        this.pullman = route.pullman;
        this.departure = route.departure;
        this.arrival = route.arrival !== undefined ? route.arrival : null;
        this.baseDeparture = route.baseDeparture !== undefined ? route.baseDeparture : null;
    }

    toArray(){
        return {
            id: this.id,
            note: this.note,
            rental: this.rental,
            loc: this.loc,
            pullman: this.pullman,
            start: this.start !== undefined ? this.start : null,
            end: this.end !== undefined ? this.end : null,
            days: this.days !== undefined ? this.days : 0,
            offset: this.offset !== undefined ? this.offset: 0,
            color: this.color
        };
    }

    
    getCalendarEvent(date){
        if(this.prev === null){
            this.start = this.departure;
            this.end = this.next.arrival;
        }

        if(this.next === null){
            this.start = this.prev.baseDeparture;
            this.end = this.arrival;
        }

        if(this.next !== null && this.prev !== null){
            this.start = this.arrival;
            this.end = this.departure;
        }

        this.offset = parseInt(moment(this.start).format("D"));

        let firstOfMonth = moment(date.startOf("month"));
        let lastOfMonth = moment(date.endOf("month"));
        
        this.start = moment(this.start);
        this.end = moment(this.end);
        if(!(this.end.format("M") === date.format("M") || this.start.format("M") === date.format("M"))){
            this.dirty = true;
        }
        /*if(this.start.isBefore(firstOfMonth)){
            const hours = this.start.hours();
            const minutes = this.start.minutes();
            this.start = moment(firstOfMonth);
            this.start.hours(hours);
            this.start.minutes(minutes);
        }
        if(this.end.isAfter(lastOfMonth)){
            const hours = this.end.hours();
            const minutes = this.end.minutes();
            this.end = moment(lastOfMonth);
            this.end.hours(hours);
            this.end.minutes(minutes);
        }*/
        
        this.days = this.getDays(this.start, this.end);

        return this;
    }

    getDays(a, b){
        let hoursDiff = b.diff(a, 'hours');

        if(hoursDiff <= 24){
            return 1
        }

        return Math.round(hoursDiff/24);
    }
}