import Route from "./Route";

class RouteList{
    
    constructor(){
        this._length = 0;
        this.head = null;
        this.tail = null;
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

    toArray(){
        /** @type Route */
        let current = this.head;
        let listArray = [];
        while(current){
            const route = {
                route: current.getRoute(),
                component: current.getComponent()
            }
            listArray.push(route);
            current = current.next;
        }
        return listArray;
    }

    [Symbol.iterator]() {
        return this.toArray();
    }
}

export default RouteList;