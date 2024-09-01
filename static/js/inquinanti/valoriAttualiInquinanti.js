elementi = {
    valoreAttuale_NO2: null,
    valoreAttuale_PM10: null,
    valoreAttuale_NH3: null,
    valoreAttuale_CO: null,
    valoreAttuale_TVOC: null,
    valoreAttuale_CO2: null,
    valoreAttuale_humidity: null,
    valoreAttuale_TVOC: null,
    valoreAttuale_CO2: null
}

listaParametri = [
    "CO2",
    "NH3",
    "CO",
    "NO2",
    "TVOC",
    "PM10",
    "humidity",
    "pressure",
    "temperature"
]

async function fetchValoriAttualiInquinanti(nomeInquinante) {
    // Fare la richiesta utilizzando fetch
    await fetch('/api/valoriAttualiInquinanti', {
        // Impostare il metodo HTTP
        method: 'POST',
        // Impostare l'intestazione
        headers: {
            'Content-Type': 'application/json',
        },
        // Impostare il corpo della richiesta
        body: JSON.stringify({ nomeInquinante: nomeInquinante })
    }
    ).then(response => {
        // Controlla se la risposta è stata corretta
        if (!response.ok) { throw new Error('Errore nella richiesta'); }
        return response.json(); // Convertire la risposta in JSON
    })

        .then(data => {
            //console.log(data)

            nomeElemento = `valoreAttuale_${nomeInquinante}`;

            elementi[nomeElemento] = document.getElementById(`valore_attuale_${nomeInquinante}`);

            if (data != null) {
                elementi[nomeElemento].innerText = data;
            } else {
                elementi[nomeElemento].innerText = "sensore spento";
            }


        })

        .catch(error => {
            console.error('Errore:', error); // Gestisci gli errori
        });
}

document.addEventListener('DOMContentLoaded', async function () {
    listaParametri.forEach((parametro) => fetchValoriAttualiInquinanti(parametro));
});

