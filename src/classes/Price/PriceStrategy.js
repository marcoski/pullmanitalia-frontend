class PriceStrategy{
    /**
     * 
     * @param {Pullman} pullman 
     * @param {moment.duration} duration 
     * @param {int} distance 
     */
    constructor(pullman, duration, distance){
        this.pullman = pullman;
        this.duration = duration;
        this.distance = distance;
    }

    price(){
    }
}

export default PriceStrategy;