/*eslint-disable*/
/*console.log('Hello from the client side');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);*/

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidmFpYmhhdmJhbnNhbCIsImEiOiJja2Q1bm1mM2IwMnkyMnpuNTY5ZjR2eTlwIn0.-m5P9LsoQL1RQFdf77boJQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/vaibhavbansal/ckd5nt7df08e01jlnr47qjonx',
        scrollZoom:false
        
    });

    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker'
        new mapboxgl.Marker({
            element:el,
            anchor:'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        new mapboxgl.Popup({
            offset:30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map)

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds,{
        padding:{
            top:200,
            bottom:150,
            left:100,
            right:100
        }
    });

}


