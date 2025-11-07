// Definizione degli elementi inquinanti
let elementi = {
    valoreAttuale_NO2: null,
    valoreAttuale_PM10: null,
    valoreAttuale_NH3: null,
    valoreAttuale_CO: null,
    valoreAttuale_TVOC: null,
    valoreAttuale_CO2: null,
    valoreAttuale_humidity: null,
    valoreAttuale_pressure: null,
    valoreAttuale_temperature: null
};

// Definizione dei parametri (inquinanti)
let listaParametri = {
    "CO2": "ppm",
    "NH3": "ppm",
    "CO": "ppm",
    "NO2": "ppm",
    "TVOC": "ppm",
    "PM10": "1/cu. ft.",
    "humidity": "%",
    "pressure": "hPa",
    "temperature": "°C"
};

// Funzione per recuperare i valori attuali di tutti gli inquinanti in una singola richiesta
async function fetchValoriAttualiInquinanti() {
    try {
        // Fare la richiesta utilizzando fetch
        const response = await fetch('/api/valoriAttualiInquinanti', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error('Errore nella richiesta');
        }

        const data = await response.json(); // Convertire la risposta in JSON

        // Iterare su ogni parametro e aggiornare gli elementi DOM corrispondenti
        Object.keys(listaParametri).forEach((parametro) => {
            let nomeElemento = `valoreAttuale_${parametro}`;
            elementi[nomeElemento] = document.getElementById(`valore_attuale_${parametro}`);

            if (data[parametro] != null) {
                // Aggiorna il contenuto dell'elemento DOM con il valore attuale
                // check if parent class is parteParametriAmbientali and do something
                if (elementi[nomeElemento].parentElement.className == "parteParametriAmbientali") {
                    elementi[nomeElemento].innerText = "Dati sensore: " + data[parametro] + " " + listaParametri[parametro];
                } else {
                    elementi[nomeElemento].innerText = data[parametro] + " " + listaParametri[parametro];
                }
            } else {
                // Se il valore è nullo, mostra che il sensore è spento
                elementi[nomeElemento].innerText = "Sensore non disponibile";
            }
        });

    } catch (error) {
        // Gestisci gli errori
        Object.keys(listaParametri).forEach((parametro) => {
            let nomeElemento = `valoreAttuale_${parametro}`;
            elementi[nomeElemento] = document.getElementById(`valore_attuale_${parametro}`);
            // Aggiorna il contenuto dell'elemento DOM con il valore attuale
            elementi[nomeElemento].innerText = "Sensore non disponibile";
        });
    }
}

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', async function () {
    // Riduci la frequenza di polling a 2s ed evita chiamate sovrapposte
    let caricamentoDatiInCorso = false;
    await fetchValoriAttualiInquinanti(); // Recupera i valori attuali di tutti gli inquinanti
    setInterval(() => {
        if (caricamentoDatiInCorso) return;
        caricamentoDatiInCorso = true;
        fetchValoriAttualiInquinanti().finally(() => { caricamentoDatiInCorso = false; });
    }, 2000);
});
