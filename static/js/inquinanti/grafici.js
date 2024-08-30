let tempoIntervallo = "WEEK";
const nomiValori = ["CO", "CO2", "PM10", "NH3", "NO2", "TVOC", "humidity", "temperature", "pressure"];

//array per memorizzare i grafici
const grafici = {graficoCO:null, graficoCO2:null, graficoPM10:null, graficoNH3:null, graficoNO2:null, graficoTVOC:null};

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
      
        nomeGrafico = `grafico${inquinante}`;

        // se il grafico esiste già viene smantellato
        if (grafici[nomeGrafico]){
          grafici[nomeGrafico].destroy()
        }

        grafici[nomeGrafico] = new Chart(ctx, {
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

async function setGrafici(){
  nomiValori.forEach((inquinante) => fetchInquinanti(inquinante, 1, tempoIntervallo));
}


function setOra(){
  tempoIntervallo = "HOUR";
  setGrafici();
}
function setGiorno(){
  tempoIntervallo = "DAY";
  setGrafici();
}
function setSettimana(){
  tempoIntervallo = "WEEK";
  setGrafici();
}
function setMese(){
  tempoIntervallo = "MONTH";
  setGrafici();
}
function setAnno(){
  tempoIntervallo = "YEAR";
  setGrafici();
}



setGrafici();