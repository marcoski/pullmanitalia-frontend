export default class EventCollisions{

    constructor(event, graph){
        this.event = event;
        this.graph = graph
        this.graph.create(event.id);
    }

    detectCollisions(events){
        let collisions = 1;
        let aT = parseInt(this.event.start.format("D"));
        let bT = parseInt(this.event.end.format("D"));
        for(let i = aT; i <= bT; i++){
            for(let e of events){
                if(i === parseInt(e.start.format("D") || i === parseInt(e.end.format("D")))){
                    collisions++;
                    this.graph.add(this.event.id, e.id);
                    continue;
                }
            }
        }

        return collisions;
    }
}