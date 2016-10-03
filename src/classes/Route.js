class Route{
    constructor(id, route, component){
        this.prev = null;
        this.next = null;
        this.id = id;
        this.from = route;
        this.to = null;
        this.arrival = null;
        this.departure = null;
        this.distance = null;
        this.duration = null;
        this.isReturn = false;
        this.component = component
    }

    getComponent(){
        return this.component
    }

    getRouteFrom(){
        return this.from;
    }

    getRouteTo(){
        return this.to;
    }
}

export default Route;