let tempoIntervallo = "WEEK";
const nomiValori = ["CO", "CO2", "PM10", "NH3", "NO2", "TVOC", "humidity", "temperature", "pressure"];

let unitDisplay = {
    "HOUR": "minute",
    "DAY": "hour",
    "WEEK": "day",
    "MONTH": "day",
    "YEAR": "month"
}
//array per memorizzare i grafici
const grafici = { graficoCO: null, graficoCO2: null, graficoPM10: null, graficoNH3: null, graficoNO2: null, graficoTVOC: null };

// Funzione per richiamare i dati di tutti gli inquinanti
async function fetchInquinanti(valoreIntervallo, tempoIntervallo) {
    try {
        const response = await fetch('/api/inquinanti', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ valoreIntervallo: valoreIntervallo, tempoIntervallo: tempoIntervallo })
        });

        if (!response.ok) {
            throw new Error('Errore nella richiesta');
        }

        const data = await response.json();

        nomiValori.forEach((inquinante) => {
            let inquinanteValori = data
                .map((item, index) => item[inquinante] !== null && item[inquinante] !== 0 ? { value: parseFloat(item[inquinante]), date: new Date(item.data) } : null)
                .filter(item => item !== null);
            let inquinanteDate = inquinanteValori.map(item => item.date);
            let inquinanteValoriFiltered = inquinanteValori.map(item => item.value);

            let ctx = document.getElementById(`grafico_${inquinante}`);

            let nomeGrafico = `grafico${inquinante}`;

            if (grafici[nomeGrafico]) {
                grafici[nomeGrafico].data.labels = inquinanteDate;
                grafici[nomeGrafico].data.datasets[0].data = inquinanteValoriFiltered;
                grafici[nomeGrafico].update('active');
                return;
            }

            grafici[nomeGrafico] = new Chart(ctx, {
                type: 'line', // Tipo di grafico
                data: {
                    labels: inquinanteDate, // Asse X - Date
                    datasets: [{
                        label: `${inquinante}`,
                        data: inquinanteValoriFiltered, // Asse Y - Valori di umidità
                        autoSkip: true,
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: unitDisplay[tempoIntervallo],
                                displayFormats: {
                                    day: 'MMM d HH:mm'
                                }
                            },
                            ticks: {
                                maxTicksLimit: 12,
                                autoSkip: true,
                                autoSkipPadding: 20
                            }
                        }
                    }
                }
            });
        });
    } catch (error) {
        console.error('Errore:', error);
    }
}

// Funzione per impostare i grafici
async function setGrafici() {
    await fetchInquinanti(1, tempoIntervallo);
}

function setOra() {
    tempoIntervallo = "HOUR";
    setGrafici();
}
function setGiorno() {
    tempoIntervallo = "DAY";
    setGrafici();
}
function setSettimana() {
    tempoIntervallo = "WEEK";
    setGrafici();
}
function setMese() {
    tempoIntervallo = "MONTH";
    setGrafici();
}
function setAnno() {
    tempoIntervallo = "YEAR";
    setGrafici();
}

document.addEventListener("DOMContentLoaded", async function () {
    setGrafici();
    setInterval(() => setGrafici(), 20000);
});

