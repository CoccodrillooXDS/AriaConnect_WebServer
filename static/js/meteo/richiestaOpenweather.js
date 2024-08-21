// Variabili per la latitudine, longitudine e chiave API
const lat = 42.6875; // Latitudine per Roma, ad esempio
const lon = 2.9006; // Longitudine per Roma, ad esempio
const apiKey = '27e4efc0e0dcc74d517448cb23a1d553'; // Inserisci la tua chiave API qui

// Costruzione dell'URL con i parametri
const url_openweather = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=it`;
const url_elevation = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
let elementi = {};

function fetchOpenWeather() {
    // Fare la richiesta utilizzando fetch
    fetch(url_openweather ).then(response => {
        // Controlla se la risposta è stata corretta
        if (!response.ok) {
            throw new Error('Errore nella richiesta');
        }
        return response.json(); // Convertire la risposta in JSON
    })
    .then(data => {
        console.log(data);

        const time = new Date();
        const dataLocale = new Date(time.getTime() + data.timezone * 1000);

        const options = {
            year: 'numeric',
            month: 'long',  // 'numeric', '2-digit', 'long', 'short', or 'narrow'
            day: 'numeric'  // 'numeric' or '2-digit'
        };
        
        // Formatta la data utilizzando le opzioni
        const dataLocaleFormattata = dataLocale.toLocaleDateString('it-IT', options); 
        dataAlba = new Date((data.sys.sunrise+data.timezone) * 1000);
        dataTramonto = new Date((data.sys.sunset+data.timezone) * 1000);
        elementi.nomeCitta.innerText = data.name;
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

        
    })
    .catch(error => {
        console.error('Errore:', error); // Gestisci gli errori
    });


    fetch(url_elevation ).then(response => {
        // Controlla se la risposta è stata corretta
        if (!response.ok) {
            throw new Error('Errore nella richiesta');
        }
        return response.json(); // Convertire la risposta in JSON
    })
    .then(data => {
        console.log(data);
        elementi.altitudine.innerText = `${data.results[0].elevation} m`
        
    })
    .catch(error => {
        console.error('Errore:', error); // Gestisci gli errori
    });
}

/* aspetta il caricamento della pagina prima di prendere i vari elementi */

document.addEventListener("DOMContentLoaded", function() {
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
        direzione_vento:  document.getElementById("direzione-vento"),
        pressione:  document.getElementById("pressione"),
        umidita:  document.getElementById("umidita"),
        visibilita:  document.getElementById("visibilita"),
        nuvolosita: document.getElementById("nuvolosita"),
        altitudine: document.getElementById("altitudine"),
    }
    
    fetchOpenWeather();

    setInterval(fetchOpenWeather, 60000);
});



