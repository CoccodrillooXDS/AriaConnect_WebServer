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
        body: JSON.stringify({ nomeInquinante: nomeInquinante})
    }
    ).then(response => {
        // Controlla se la risposta è stata corretta
        if (!response.ok) {throw new Error('Errore nella richiesta');}
        return response.json(); // Convertire la risposta in JSON
        })
  
        .then(data => {
            console.log(data)

        //TODO: fare funzioni che aggiornano il valore attuale
        })
  
        .catch(error => {
            console.error('Errore:', error); // Gestisci gli errori
        });
  }




fetchValoriAttualiInquinanti("CO2")

