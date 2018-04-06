export function getIEVersion(){
    const ua = window.navigator.userAgent;
    
    const msIE = ua.indexOf('MSIE ');
    if(msIE > 0){
        //IE 10 or older => return version number
        return parseInt(ua.substring(msIE + 5, ua.indexOf('.', msIE)), 10);
    }

    const trident = ua.indexOf('Trident/');
    if(trident > 0){
        //IE 11 => return version number
        const rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    const edge = ua.indexOf('Edge/');
    if(edge > 0){
        //Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    //other browsers
    return -1;
}