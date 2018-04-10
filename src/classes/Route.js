class Route{
    constructor(route, component){
        this.prev = null;
        this.next = null;
        this.route = route;
        this.component = component
    }

    getComponent(){
        return this.component
    }

    getRoute(){
        return this.route;
    }
}

export default Route;