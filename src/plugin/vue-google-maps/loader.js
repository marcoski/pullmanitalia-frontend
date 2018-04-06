const GmapsLoader = {
    loaded: false,
    readyPromises: [],

    load: function({apiKey, version, libraries, loadCn}){
        if(typeof window === 'undefined'){
            return Promise.resolve()
        }

        if(!this.loaded && (!window.google || !window.google.maps)){
            const googleMapsScript = document.createElement('script');

            var options = {};
            if(typeof apiKey === 'string'){
                options.key = apiKey;
            }else if(typeof apiKey === 'object'){
                for(let k in apiKey){
                    options[k] = apiKey[k];
                }
            }else{
                throw new Error('`apiKey` should either be a string or an object');
            }

            let librariesPath = '';

            if(libraries && libraries.length > 0){
                librariesPath = libraries.join(',');
                options['libraries'] = librariesPath;
            }else if(Array.prototype.isPrototypeOf(options.libraries)){
                options.libraries = options.libraries.join(',');
            }

            options['callback'] = 'googleMapsLoaded'

            let baseUrl = 'https://maps.googleapis.com/';

            if(typeof loadCn === 'boolean' && loadCn === true){
                baseUrl = 'http://maps.google.cn';
            }

            let url = baseUrl + 'maps/api/js?' +
                Object.keys(options)
                    .map((key) => encodeURIComponent(key) + '=' +  encodeURIComponent(options[key]))
                    .join('&');

            if(version){
                url = url + '&v=' + version;
            }

            googleMapsScript.setAttribute('src', url);
            googleMapsScript.setAttribute('async', '');
            googleMapsScript.setAttribute('defer', '');
            document.body.appendChild(googleMapsScript);

            window.googleMapsLoaded = this._setLoaded.bind(this);
        }else{
            console.warn('The Google Maps Library id already loaded');
            this._setLoaded();
        }
    },

    ensureReady: function(){
        if(this.loaded){
            return Promise.resolve()
        }else{
            const promise = new Promise((resolve) => {
               this.readyPromises.push(resolve)
            });

            return promise;
        }
    },

    _setLoaded: function(){
        this.loaded = true;
        for(const resolve of this.readyPromises){
            resolve();
        }
        this.readyPromises = []
    }
}

export default GmapsLoader;