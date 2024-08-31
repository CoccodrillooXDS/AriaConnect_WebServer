var lat = 45.556943047717084;
var lon = 10.217275958492516;
var qualitàAria = 2; //valore temporaneo per simulare il corretto colore del marker

let map;
let marker;
let tileLayer;

const zoomDefault = 18;
const zoomNotAvailable = 5;
let isCityAvailable = true;

async function caricaMappa() {
    // Inizializza la mappa e imposta le coordinate iniziali e il livello di zoom
    const zoomLevel = isCityAvailable ? zoomDefault : zoomNotAvailable;
    
    if (!map) {
        map = L.map('map', {gestureHandling: true}).setView([lat, lon], zoomLevel);
    } else {
        map.setView([lat, lon], zoomLevel);
    }

    // Aggiungi una tile layer (sfondo della mappa) da OpenStreetMap se non già aggiunta
    if (!tileLayer) {
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }



    // Aggiungi o sposta un marker alla mappa
    if (!marker) {
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        marker.setLatLng([lat, lon]);
    }

}

function aggiungiMarker(){
    let latitudine = (Math.random() * 180) - 90;  // Latitude range: -90 to +90
    let longitudine = (Math.random() * 360) - 180; // Longitude range: -180 to +180

    console.log(latitudine);
    console.log(longitudine);
    //costruzione di un marker custom
    const customMarker = L.AwesomeMarkers.icon({
        icon: 'circle',  // Correct FontAwesome icon name
        iconColor:"red",
        prefix: 'fa' // 'fa' for FontAwesome
    });

    L.marker([latitudine, longitudine], { icon: customMarker }).addTo(map);
}

document.addEventListener("DOMContentLoaded", async function () {
    await caricaMappa();
    await fetchPosizione(1);
});

//parametro: 1 per anche la qualità dell'aria, qualsiasi altro valore per solo la posizione
async function fetchPosizione(parametro) {
    // Fare la richiesta utilizzando fetch
    await fetch('/api/GPS', {
        // Impostare il metodo HTTP
        method: 'POST',
        // Impostare l'intestazione
        headers: {
            'Content-Type': 'application/json',
        },
        // Impostare il corpo della richiesta
        body: JSON.stringify({ parametro: parametro})
    }
    ).then(response => {
        // Controlla se la risposta è stata corretta
        if (!response.ok) {throw new Error('Errore nella richiesta');}
        return response.json(); // Convertire la risposta in JSON
        })
  
        .then(data => {
            console.log(data)
        })
  
        .catch(error => {
            console.error('Errore:', error); // Gestisci gli errori
        });
  }
