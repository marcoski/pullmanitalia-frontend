import PriceStrategy from './PriceStrategy';

class TourPrice extends PriceStrategy{
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
        const days = this.duration.asDays();
        const overTourKm = 2 * this.distance / days
        if(overTourKm > 250){
            return this.pullman.costTour * days + (2 * this.distance - days * this.pullman.costPerKm);
        }

        return this.pullman.costTour * days;
    }
}

export default TourPrice;