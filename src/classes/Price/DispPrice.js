import PriceStrategy from './PriceStrategy';

class DispPrice extends PriceStrategy{
    /**
     * 
     * @param {Pullman} pullman 
     * @param {moment.duration} duration 
     * @param {int} distance 
     */
    constructor(pullman, duration, distance){
        super(pullman, duration, distance);
    }

    price(){
        if(this.duration.hours() < 8){
            return this.halfDayPrice();
        }

        return this.dailyPrice();
    }

    dailyPrice(){
        let usage = 0;
        if(this.duration.minutes() > 0){
            usage = 1;
        }

        usage += this.duration.hours();
        
        if(usage < 13){
            return this.pullman.costDay + 2 * this.distance * this.pullman.costPerKm;
        }

        return this.pullman.costDay + 2 * this.distance * this.pullman.costPerKm + (usage - 12) * this.pullman.costHour
    }

    halfDayPrice(){
        let usage = 0;
        if(this.duration.minutes() > 0){
            usage = 1;
        }
        
        return (usage - 4) * this.pullman.costHour + this.pullman.costHalfDay + 2 * this.distance * this.pullman.costPerKm;
    }
}

export default DispPrice;