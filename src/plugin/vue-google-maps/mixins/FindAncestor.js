export default{
    methods: {
        $_findAncestor: function(condition){
            let search = this.$parent;

            while(search){
                if(condition(search)){
                    return search;
                }
                search = search.$parent;
            }

            return null;
        }
    }
}