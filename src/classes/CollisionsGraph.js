export default class CollisionsGraph {

    constructor(){
        this.graphs = {};
    }

    create(id){
        if(this.graphs[id] === undefined){
            this.graphs[id] = [];
        }

    }

    add(id, event){
        if(!this.exists(event)){
            this.graphs[id].push(event);
        }
    }

    createPositionGraphs(){
        for(let id in this.graphs){
            if(this.graphs[id].length === 0){
                delete this.graphs[id];
            }
        }
    }

    getGraph(id){
        return this.graphs[id] === undefined ? null : this.graphs[id];
    }

    exists(event){
        for(let id in this.graphs){
            if(id == event){
                return true;
            }

            let g = this.graphs[id].filter((e) => e === event);
            if(g.length > 0){
                return true;
            }
        }

        return false;
    }

}