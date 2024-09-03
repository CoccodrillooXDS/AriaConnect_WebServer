let tempoIntervallo = "WEEK";
const nomiValori = ["CO", "CO2", "PM10", "NH3", "NO2", "TVOC", "humidity", "temperature", "pressure"];

const unitDisplay = {
    "HOUR": "minute",
    "DAY": "minute",
    "WEEK": "day",
    "MONTH": "day",
    "YEAR": "month"
}

const limitiLegge = {
    "NO2": 2.5,
    "PM10": 1350,
    "NH3": 67,
    "CO": 165,
    "TVOC": 4500,
    "CO2": 4000,
}
// TODO: Sistemare i limiti di legge

let limiti = {}

//array per memorizzare i grafici
const grafici = { graficoCO: null, graficoCO2: null, graficoPM10: null, graficoNH3: null, graficoNO2: null, graficoTVOC: null };

//funzione per calcolare la media mobile semplice (fa apparire i grafici più curvi)
function calculateSMA(data, windowSize) {
    let sma = [];

    for (let i = 0; i <= data.length - windowSize; i++) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
            sum += data[i + j];
        }
        sma.push(sum / windowSize);
    }

    return sma;
}

// Function to identify gaps in the data
function identifyGaps(data, threshold = 30000) { // 30 seconds threshold
    let gaps = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i].date - data[i - 1].date > threshold) {
            gaps.push({ start: data[i - 1].date, end: data[i].date });
        }
    }
    return gaps;
}

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
            inquinanteValoriFiltered = calculateSMA(inquinanteValoriFiltered, 75);

            console.log(inquinanteValori, inquinanteDate, inquinanteValoriFiltered);

            // Identify gaps in the data
            let gaps = identifyGaps(inquinanteValori);

            let ctx = document.getElementById(`grafico_${inquinante}`);
            let nomeGrafico = `grafico${inquinante}`;

            let limite;

            if (limitiLegge[inquinante] == null) {
                limite = {
                    label: 'Limite',
                    data: Array(inquinanteValoriFiltered.length).fill(null),
                    borderDash: [2, 2], // Dashed line style
                    pointRadius: 0,
                    pointHitRadius: 0,
                    pointHoverRadius: 0,
                    borderColor: '#D76F65',
                };
            } else {
                limite = {
                    label: 'Limite',
                    data: Array(inquinanteValoriFiltered.length).fill(limitiLegge[inquinante]),
                    borderDash: [2, 2], // Dashed line style
                    pointRadius: 0,
                    pointHitRadius: 0,
                    pointHoverRadius: 0,
                    borderColor: '#D76F65',
                }
            }

            if (grafici[nomeGrafico]) {
                grafici[nomeGrafico].data.labels = inquinanteDate;
                grafici[nomeGrafico].data.datasets[0].data = inquinanteValoriFiltered;
                grafici[nomeGrafico].data.datasets[1] = limite;
                grafici[nomeGrafico].options.scales.x.time.unit = unitDisplay[tempoIntervallo];
                grafici[nomeGrafico].update('active');
                return;
            }

            grafici[nomeGrafico] = new Chart(ctx, {
                type: 'line', // Tipo di grafico
                data: {
                    labels: inquinanteDate, // Asse X - Date
                    datasets: [
                        {
                            label: `${inquinante}`,
                            data: inquinanteValoriFiltered, // Asse Y - Valori di umidità
                            borderColor: '#659CD6', // Default color
                            segment: {
                                borderColor: ctx => {
                                    let currentIndex = ctx.p0DataIndex;
                                    let nextIndex = ctx.p1DataIndex;
                                    let currentDate = inquinanteDate[currentIndex];
                                    let nextDate = inquinanteDate[nextIndex];
                                    return nextDate - currentDate > 30000 ? '#665959' : '#659CD6'; // Change color if gap is more than 30 seconds
                                }
                            },
                            autoSkip: true,
                        },
                        limite
                    ],
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: unitDisplay[tempoIntervallo],
                                displayFormats: {
                                    minute: 'HH:mm',
                                    hour: 'HH:mm',
                                    day: 'MMM d',
                                }
                            },
                            ticks: {
                                // maxTicksLimit: 12,
                                autoSkip: true,
                                autoSkipPadding: 20
                            }
                        }
                    }
                }
            });
        });

        if (limitiLegge[inquinante] != null) {
            grafici[nomeGrafico].data.datasets[1] = limite;
        } else {
            grafici[nomeGrafico].data.datasets[1] = null;
        }
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

