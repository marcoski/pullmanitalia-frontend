class VoucherGenerator{
    constructor(config = {}){
        this.count = config.count || 1;
        this.length = config.length || 6;
        this.charset = config.charset || this.getCharset('alphanumeric_upper');
        this.prefix = config.prefix || '';
        this.postfix = config.postfix || '';
        this.pattern = config.pattern || this.repeat('#', this.length);
    }

    getCharset(name){
        const charset = {
            numbers: '0123456789',
            alphabetic_lower: 'abcdefghijklmnopqrstuvwxyz',
            alphabetic_upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            alphabetic: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            alphanumeric_lower: '0123456789abcdefghijklmnopqrstuvwxyz',
            alphanumeric_upper: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            alphanumeric: '0123456789abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        }

        return charset[name];
    }

    repeat(str, count){
        let res = '';
        for(let i = 0; i < count; i++){
            res += str;
        }
        return res;
    }

    isFeasible(){
        return Math.pow(this.charset.length, (this.pattern.match(/#/g) || []).length) >= this.count;
    }

    randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomElem(arr){
        return arr[this.randomInt(0, arr.length - 1)];
    }

    generateOneCode(){
        let code = this.pattern.split('').map((char) => {
            if(char === '#'){
                return this.randomElem(this.charset);
            }else{
                return char;
            }
        }).join('');

        return this.prefix + code + this.postfix;
    }

    generate(){
        if(!this.isFeasible()){
            throw new Error("Not possible to generate requested number of codes");
        }
        let count = this.count;
        let codes = {};
        while(count > 0){
            let code = this.generateOneCode();
            if(codes[code] === undefined){
                codes[code] = true;
                count--;
            }
        }
        if(this.count > 1){
            return Object.keys(codes);
        }

        return Object.keys(codes).pop();
    }
}

export default VoucherGenerator