async function fetchInquinanti(inquinante, valoreIntervallo, tempoIntervallo) {
  // Fare la richiesta utilizzando fetch
  await fetch('/api/inquinanti', {
      // Impostare il metodo HTTP
      method: 'POST',
      // Impostare l'intestazione
      headers: {
          'Content-Type': 'application/json',
      },
      // Impostare il corpo della richiesta
      body: JSON.stringify({ inquinante: inquinante, valoreIntervallo: valoreIntervallo, tempoIntervallo:tempoIntervallo})
  }
  ).then(response => {
      // Controlla se la risposta è stata corretta
      if (!response.ok) {throw new Error('Errore nella richiesta');}
      return response.json(); // Convertire la risposta in JSON
      })

      .then(data => {

        let inquinanteValori = data.map(item => item[1]); //array he andrà messo sull'asse delle y
        let inquinanteDate = data.map(item => item[0]); //array he andrà messo sull'asse delle x


        let ctx = document.getElementById(`grafico_${inquinante}`);

        const graficoUmidita = new Chart(ctx, {
          type: 'line', // Tipo di grafico
          data: {
            labels: inquinanteDate, // Asse X - Date
            datasets: [{
              label: 'Umidità',
              data: inquinanteValori, // Asse Y - Valori di umidità
            }]
          },
          options: {
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Date'
                }
              },
              y: {
                display: true,
              }
            }
          }
      });


      })

      .catch(error => {
          console.error('Errore:', error); // Gestisci gli errori
      });
}



fetchInquinanti("CO2", 2, "HOUR");
fetchInquinanti("CO", 2, "HOUR");
fetchInquinanti("NH3", 2, "HOUR");
fetchInquinanti("NO2", 2, "HOUR");
fetchInquinanti("TVOC", 2, "HOUR");
fetchInquinanti("PM10", 10, "HOUR");