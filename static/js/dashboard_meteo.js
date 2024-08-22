// Latitudine e longitudine dell'I.I.S. Benedetto Castelli di Brescia
var lat = 45.556943047717084;
var lon = 10.217275958492516;

var elementi = {};

let map;
let marker;
let tileLayer;

const zoomDefault = 18;
const zoomNotAvailable = 5;
let isCityAvailable = true;

async function fetchOpenWeather() {
    // Fare la richiesta utilizzando fetch
    await fetch('/api/openweather', {
        // Impostare il metodo HTTP
        method: 'POST',
        // Impostare l'intestazione
        headers: {
            'Content-Type': 'application/json',
        },
        // Impostare il corpo della richiesta
        body: JSON.stringify({ lat: lat, lon: lon })
    }
    ).then(response => {
        // Controlla se la risposta è stata corretta
        if (!response.ok) {
            throw new Error('Errore nella richiesta');
        }
        return response.json(); // Convertire la risposta in JSON
    })
        .then(data => {
            const time = new Date();
            const dataLocale = new Date(time.getTime() + data.timezone * 1000);

            const options = {
                year: 'numeric',
                month: 'long',  // 'numeric', '2-digit', 'long', 'short', or 'narrow'
                day: 'numeric'  // 'numeric' or '2-digit'
            };

            // Formatta la data utilizzando le opzioni
            const dataLocaleFormattata = dataLocale.toLocaleDateString('it-IT', options);
            dataAlba = new Date((data.sys.sunrise + data.timezone) * 1000);
            dataTramonto = new Date((data.sys.sunset + data.timezone) * 1000);
            elementi.nomeCitta.innerText = data.name;
            if (data.name === "" || data.name === undefined) {
                document.getElementsByClassName('prima-riga')[0].style.display = "none";
                elementi.nomeCitta.innerText = "Nome città non disponibile";
                isCityAvailable = false;
            } else {
                document.getElementsByClassName('prima-riga')[0].removeAttribute("style");
                isCityAvailable = true;
            }
            elementi.iconaMeteo.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            elementi.descrizione.innerText = data.weather[0].description;
            elementi.alba.innerText = `${dataAlba.getUTCHours().toString().padStart(2, '0')}:${dataAlba.getUTCMinutes().toString().padStart(2, '0')}`;
            elementi.tramonto.innerText = `${dataTramonto.getUTCHours().toString().padStart(2, '0')}:${dataTramonto.getUTCMinutes().toString().padStart(2, '0')}`;
            elementi.ora.innerText = `${dataLocale.getUTCHours().toString().padStart(2, '0')}:${dataLocale.getUTCMinutes().toString().padStart(2, '0')}`;
            elementi.data.innerText = `${dataLocaleFormattata}`;

            elementi.temperaturaAttuale.innerText = `${data.main.temp.toFixed(0)}°`;
            elementi.temperaturaMassima.innerHTML = `<i class="fa-solid fa-up"></i><strong>${data.main.temp_max.toFixed(0)}°</strong>`;
            elementi.temperaturaMinima.innerHTML = `<i class="fa-solid fa-down"></i><strong>${data.main.temp_min.toFixed(0)}°</strong>`;

            elementi.vento.innerText = `${data.wind.speed} m/s`;
            elementi.direzione_vento.innerText = `${data.wind.deg}°`;

            elementi.pressione.innerText = `${data.main.pressure} hPa`;
            elementi.umidita.innerText = `${data.main.humidity} %`;
            elementi.visibilita.innerText = `${(data.visibility)} m`;
            elementi.nuvolosita.innerText = `${data.clouds.all} %`;
            elementi.altitudine.innerText = `${data.elevation} m`;

            // Rimuovi lo stile da meteo
            document.getElementsByClassName('meteo')[0].removeAttribute("style");
        })
        .catch(error => {
            console.error('Errore:', error); // Gestisci gli errori
        });
}

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

    // Costruisci il contenuto del popup condizionalmente
    let popupContent = '';
    if (isCityAvailable) {
        popupContent += `<strong>${elementi.nomeCitta.innerHTML}</strong><br>`;
    }
    popupContent += `<strong>Latitudine:</strong> ${lat}<br><strong>Longitudine:</strong> ${lon}<br><strong>Altitudine:</strong> ${elementi.altitudine.innerHTML}`;
    
    // Modifica il contenuto del popup
    marker.bindPopup(popupContent).openPopup();
}

async function caricaTutto() {
    await fetchOpenWeather();
    await caricaMappa();
}

/* aspetta il caricamento della pagina prima di prendere i vari elementi */

document.addEventListener("DOMContentLoaded", async function () {
    elementi = {
        nomeCitta: document.getElementById("citta"),
        iconaMeteo: document.getElementById("icona"),
        descrizione: document.getElementById("descrizione"),
        data: document.getElementById("data"),
        ora: document.getElementById("ora"),
        alba: document.getElementById("alba"),
        tramonto: document.getElementById("tramonto"),
        data: document.getElementById("data"),
        ora: document.getElementById("ora"),
        temperaturaAttuale: document.getElementById("temperatura"),
        temperaturaMassima: document.getElementById("massimo"),
        temperaturaMinima: document.getElementById("minimo"),
        vento: document.getElementById("vento"),
        direzione_vento: document.getElementById("direzione-vento"),
        pressione: document.getElementById("pressione"),
        umidita: document.getElementById("umidita"),
        visibilita: document.getElementById("visibilita"),
        nuvolosita: document.getElementById("nuvolosita"),
        altitudine: document.getElementById("altitudine"),
    }

    await caricaTutto();

    setInterval(caricaTutto, 30000);
    // TODO: Ricarica tutto automaticamente quando ci sono nuovi dati tramite WebSocket
});
