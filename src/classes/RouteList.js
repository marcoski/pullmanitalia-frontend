import Route from "./Route";

class RouteList{
    
    constructor(){
        this._length = 0;
        this.head = null;
        this.tail = null;
    }

    count(){
        return this._length;
    }

    add(route){
        if(!this.head){
            this.head = route;
            this.tail = route;
        } else {
            route.prev = this.tail;
            this.tail.next = route;
            this.tail = route;
        }

        this._length++;

        return route;
    }

    remove(route){
        if(route.prev == null){
            this.head = route.next;
        } else {
            route.prev.next = route.next
        }

        if(route.next == null){
            this.tail = route.prev;
        } else {
            route.next.prev = route.prev;
        }

        this._length--;
    }

    pop(){
        const route = this.tail;
        this.remove(route);
        return route;
    }

    find(callback){
        let current = this.head;
        let index = 0;
        while(current){
            if(callback.call(this, current, index)){
                return current;
            }
            index++;
            current = current.next;
        }

        return null;
    }

    findIndex(callback){
        let current = this.head;
        let index = 0;
        while(current){
            if(callback.call(this, current, index)){
                return index;
            }
            index++;
            current = current.next;
        }

        return null;
    }

    getFirst(){
        return this.head;
    }

    getLast(){
        return this.tail;
    }

    isLast(compare){
        const last = this.getLast();
        return compare.call(this, last);
    }

    getSteps(){
        let current = this.head;
        let steps = [];
        while(current){
            steps.push(current.from);
            steps.push(current.to);
            current = current.next;
        }

        steps = steps.reduce((acc, value, index) => {
            if(index === 0 || index === steps.length - 1){
                acc.push(value);
            }else{
                const found = acc.find((s) => { return s.address === value.address });
                if(found === undefined){
                    acc.push(value);
                }
            }

            return acc;
        }, []);

        return steps;
    }

    toArray(){
        /** @type Route */
        let current = this.head;
        let listArray = [];
        while(current){
            const route = {
                id: current.id,
                prev: current.prev,
                next: current.next,
                from: current.getRouteFrom(),
                to: current.getRouteTo(),
                arrival: current.arrival,
                departure: current.departure,
                distance: current.distance,
                duration: current.duration,
                isReturn: current.isReturn,
                component: current.getComponent()
            }
            listArray.push(route);
            current = current.next;
        }
        return listArray;
    }

    toString(){
        return JSON.parse(JSON.stringify(this.toArray()));
    }

    static toModel(route){
        return {
            id: route.id,
            from: route.from,
            to: route.to,
            arrival: route.arrival,
            departure: route.departure,
            distance: route.duration
        }
    }
}

export default RouteList;