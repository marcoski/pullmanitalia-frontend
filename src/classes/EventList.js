export default class EventList{

    constructor(){
        this._length = 0;
        this.head = null;
        this.tail = null;
    }

    add(event){
        if(!this.head){
            this.head = event;
            this.tail = event;
        } else {
            event.prev = this.tail;
            this.tail.next = event;
            this.tail = event;
        }

        this._length++;

        return event;
    }

    remove(event){
        if(event.prev == null){
            this.head = event.next;
        } else {
            event.prev.next = event.next
        }

        if(event.next == null){
            this.tail = event.prev;
        } else {
            event.next.prev = event.prev;
        }

        this._length--;
    }

    filter(compare){
        let current = this.head;
        let newList = new EventList();
        while(current){
            if(compare && compare(current)){
                newList.add(current);
            }

            current = current.next;
        }

        return newList;
    }

    toArray(){
        let current = this.head;
        let listArray = [];
        while(current){
            listArray.push(current.toArray());
            current = current.next;
        }
        return listArray;
    }

}