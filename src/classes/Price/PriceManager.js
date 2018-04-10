import DispPrice from "./DispPrice";
import TrfPrice from "./TrfPrice";
import TourPrice from "./TourPrice";

class PriceManager{
    /**
     * 
     * @param {int} type 
     * @param {Pullman} pullman 
     * @param {moment.duration} duration 
     * @param {int} distance in m 
     */
    constructor(type, pullman, duration, distance){
        if(type === PriceManager.DISP){
            this.strategy = new DispPrice(pullman, duration, distance);
        }else if(type === PriceManager.TRF){
            this.strategy = new TrfPrice(pullman, duration, distance);
        }else{
            this.strategy = new TourPrice(pullman, duration, distance);
        }
    }

    price(){
        return this.strategy.price().toFixed(2);
    }
}


PriceManager.DISP = 0;
PriceManager.TRF = 1;
PriceManager.TOUR = 2;

export default PriceManager;