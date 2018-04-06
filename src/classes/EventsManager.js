import moment from 'moment';
import EventList from "./EventList";
import Event from "./Event";
import ColorSchemer from "./ColorSchemer";

const baseColors = [
    "20a8d8", "6610f2", "6f42c1", "e83e8c", "f86c6b", "f8cb00", "ffc107", "4dbd74", "20c997", "63c2de" 
]

export default class EventsManager{
    
    /**
     * Construct an events manager
     * @param {[]} routes the routes for the given supplier
     * @param {moment} moment Date for which calendar is set
     */
    constructor(routes, date){
        this.date = date;
        this.calendarEvents = [];
        this.dateFirstOfMonth = moment(date).startOf('month');
        this.dateLastOfMonth = moment(date).endOf('month');
        let color = null;
        this.events = routes.reduce((accumulator, route, i) => {
            if(accumulator[route.rental.id] === undefined){
                if(route.rental.color === null){
                    const colorSchemer = new ColorSchemer(baseColors[Math.floor(Math.random() * baseColors.length)], 4);
                    color = colorSchemer.getRandomColor();   
                }
                accumulator[route.rental.id] = new EventList();
            }
            const event = new Event(route, route.rental.color === null ? color : route.rental.color);
            accumulator[route.rental.id].add(event);
            return accumulator;
        }, {});
    }

    generateCalendarEvents(){
        let calendarEvents = [];

        for(let rental in this.events){
            const reducedEvents = this.events[rental].filter((e) => {
                e.getCalendarEvent(this.date);
                return !e.dirty;
            });
            //reducedEvents.reduceSameDays();
            calendarEvents.push(reducedEvents);
        }
        this.calendarEvents = calendarEvents.reduce((acc, val) => {
            return acc.concat(val.toArray());
        }, []);
    }

    /**
     * 
     * @param moment a 
     * @param moment b 
     */
    getDays(a, b){
        let hoursDiff = b.diff(a, 'hours');

        if(hoursDiff < 8){
            return 0.5
        }else if(hoursDiff >= 8 && hoursDiff <= 24){
            return 1;
        }

        return Math.round(hoursDiff/24);
    }
}