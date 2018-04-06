export function autoCall(value){
    return typeof value === 'function' ? value() : value;
}

export function capitalize(text){
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Returns the zoom level at wich the given rectangular region fits in the map view.
 * The zoom level is computed for currently selected map type.
 * @param {google.maps.Map} map 
 * @param {google.maps.LatLngBounds} bounds
 * @return {Number} zoom level 
 */
export function getZoomByBounds(map, bounds){

    function latRad(lat){
        let sin = Math.sin(lat * Math.PI / 180);
        let radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction){
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const maxZoom = 21;
    const minZoom = 0;
    
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();

    let latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    let lngDiff = ne.lng() - sw.lng();
    let lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    let latZoom = zoom(map.getDiv().offsetHeight, 256, latFraction);
    let lngZoom = zoom(map.getDiv().offsetWidth, 256, lngFraction);

    return Math.min(latZoom, lngZoom, maxZoom);
}