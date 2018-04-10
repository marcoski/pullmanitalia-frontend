import PriceStrategy from './PriceStrategy';

class TrfPrice extends PriceStrategy{
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
        if(this.distance < 120){
            return 3.5 * this.pullman.costHour + 2 * this.distance * this.pullman.costPerKm;
        }
        return 2 * this.distance * this.pullman.costTransferPerKm;
    }
}

export default TrfPrice;