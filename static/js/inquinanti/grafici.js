let tempoIntervallo = "DAY";
// valoreIntervallo è il valore numerico usato nell'INTERVALLO SQL (es., 5, 30, 1)
let valoreIntervallo = 1;
const nomiValori = ["CO", "CO2", "PM10", "NH3", "NO2", "TVOC", "humidity", "temperature", "pressure"];

const unitDisplay = {
    "HOUR": "minute",
    "DAY": "minute",
    "MINUTE": "minute",
    "WEEK": "day",
    "MONTH": "day",
    "YEAR": "month"
}

const limitiLegge = {
    "NO2": 1,
    "PM10": 1637,
    "NH3": 50,
    "CO": 100,
    "TVOC": 1000,
    "CO2": 5000,
    "humidity": 60,
    "temperature": 27
}

const unitaAsseY = {
    "NO2": "ppm",
    "PM10": "1/cu. ft.",
    "NH3": "ppm",
    "CO": "ppm",
    "TVOC": "ppm",
    "CO2": "ppm",
    "humidity": "%",
    "temperature": "°C",
    "pressure": "hPa"
}

let limiti = {}

var isChromium = !!window.chrome;
var isSafari = !!window.safari;

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

// Guard to avoid overlapping requests
let caricamentoDatiInCorso = false;
// Funzione per richiamare i dati di tutti gli inquinanti
async function fetchInquinanti(valoreIntervallo, tempoIntervallo) {
    if (caricamentoDatiInCorso) return; // skip if a fetch is already running
    caricamentoDatiInCorso = true;
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

            // Applica SMA (smussamento) solo per intervalli di tempo lunghi dove è desiderata l'aggregazione
            // NON applicare SMA per intervalli brevi/in tempo reale come MINUTE, HOUR o DAY perché
            // smusserebbe i picchi reali a breve termine (es. grafici da 5/30 minuti).
            if (inquinanteValoriFiltered.length > 40 && (tempoIntervallo === "WEEK" || tempoIntervallo === "MONTH" || tempoIntervallo === "YEAR")) {
                inquinanteValoriFiltered = calculateSMA(inquinanteValoriFiltered, 20);
            }

            let ctx = document.getElementById(`grafico_${inquinante}`);
            let nomeGrafico = `grafico${inquinante}`;

            let limiteArray = (limitiLegge[inquinante] != null) ? Array(inquinanteValoriFiltered.length).fill(limitiLegge[inquinante]) : Array(inquinanteValoriFiltered.length).fill(null);

            const limite = {
                label: 'Limite',
                data: limiteArray,
                borderDash: [2, 2], // Dashed line style
                pointRadius: 0,
                pointHitRadius: 0,
                pointHoverRadius: 0,
                borderColor: '#D76F65',
            };

            // Ottimizza le opzioni del grafico per una migliore visualizzazione dei dati in base alla quantità di dati presenti e all'intervallo di tempo scelto
            let chartOptions = {
                animation: { duration: 0 },
                hover: { animationDuration: 0 },
                responsiveAnimationDuration: 0,
                resizeDelay: 0,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: unitDisplay[tempoIntervallo],
                            displayFormats: {
                                minute: 'HH:mm',
                                hour: 'HH:mm',
                                day: 'MMM d',
                                month: 'MMM yyyy'
                            }
                        },
                        ticks: { autoSkip: true }
                    },
                    y: {
                        ticks: {
                            callback: function (value) {
                                return `${value.toFixed(2)} ${unitaAsseY[inquinante]}`;
                            }
                        },
                    }
                }
            };

            // Se il grafico esiste, aggiorna i suoi dati invece di distruggerlo/crearlo
            if (grafici[nomeGrafico]) {
                try {
                    const chart = grafici[nomeGrafico];

                    // Aggiorna le etichette e i dati del dataset primario in loco
                    chart.data.labels = inquinanteDate;
                    if (chart.data.datasets && chart.data.datasets.length > 0) {
                        // Aggiorna il primo dataset
                        chart.data.datasets[0].label = `${inquinante}`;
                        chart.data.datasets[0].data = inquinanteValoriFiltered;
                        chart.data.datasets[0].borderColor = '#659CD6';
                        chart.data.datasets[0].pointRadius = tempoIntervallo === "HOUR" || tempoIntervallo === "DAY" ? 3 : 1;
                        // Riassegna la funzione di segmento per garantire che utilizzi le date correnti
                        chart.data.datasets[0].segment = {
                            borderColor: ctx => {
                                let currentIndex = ctx.p0DataIndex;
                                let nextIndex = ctx.p1DataIndex;
                                let currentDate = inquinanteDate[currentIndex];
                                let nextDate = inquinanteDate[nextIndex];
                                return nextDate - currentDate > 90000 ? '#665959' : '#659CD6';
                            }
                        };
                    }
                    // Aggiorna o crea il dataset del limite
                    if (chart.data.datasets && chart.data.datasets.length > 1) {
                        chart.data.datasets[1].data = limiteArray;
                        chart.data.datasets[1].borderColor = '#D76F65';
                    } else {
                        chart.data.datasets = chart.data.datasets.slice(0,1).concat([limite]);
                    }

                    // Aggiorna solo le opzioni sicure al posto di unire l'intero oggetto delle opzioni
                    chart.options.animation = chartOptions.animation;
                    chart.options.hover = chartOptions.hover;
                    chart.options.responsive = chartOptions.responsive;
                    chart.options.maintainAspectRatio = chartOptions.maintainAspectRatio;
                    chart.options.scales = chartOptions.scales;

                    chart.update('none'); // Nessuna animazione
                } catch (e) {
                    console.error('Error updating chart, recreating:', e);
                    // Fallback -- Ricrea il grafico
                    grafici[nomeGrafico].destroy();
                    grafici[nomeGrafico] = new Chart(ctx, { type: 'line', data: { labels: inquinanteDate, datasets: [{ label: `${inquinante}`, data: inquinanteValoriFiltered, borderColor: '#659CD6', pointRadius: tempoIntervallo === "HOUR" || tempoIntervallo === "DAY" ? 3 : 1, pointHoverRadius: 5 }, limite] }, options: chartOptions });
                }
            } else {
                grafici[nomeGrafico] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: inquinanteDate,
                        datasets: [
                            {
                                label: `${inquinante}`,
                                data: inquinanteValoriFiltered,
                                borderColor: '#659CD6',
                                pointRadius: tempoIntervallo === "HOUR" || tempoIntervallo === "DAY" ? 3 : 1,
                                pointHoverRadius: 5,
                                segment: {
                                    borderColor: ctx => {
                                        let currentIndex = ctx.p0DataIndex;
                                        let nextIndex = ctx.p1DataIndex;
                                        let currentDate = inquinanteDate[currentIndex];
                                        let nextDate = inquinanteDate[nextIndex];
                                        return nextDate - currentDate > 90000 ? '#665959' : '#659CD6';
                                    }
                                },
                            },
                            limite
                        ],
                    },
                    options: chartOptions
                });
            }

            if (isChromium || isSafari) {
                if (ctx && ctx.parentElement && ctx.parentElement.classList && ctx.parentElement.classList.contains("parteParametriAmbientali")) {
                    ctx.style.marginBottom = "60px";
                    if (ctx.nextElementSibling) ctx.nextElementSibling.style.marginTop = "-60px";
                } else if (ctx) {
                    ctx.style.marginBottom = "30px";
                }
            }
        });
    } catch (error) {
        console.error('Errore:', error);
    } finally {
        caricamentoDatiInCorso = false;
    }
}

// Funzione per impostare i grafici
async function setGrafici() {
    // Passa sia valoreIntervallo che tempoIntervallo al backend
    await fetchInquinanti(valoreIntervallo, tempoIntervallo);
}

function setOra() {
    valoreIntervallo = 1;
    tempoIntervallo = "HOUR";
    setGrafici();
}
function setGiorno() {
    valoreIntervallo = 1;
    tempoIntervallo = "DAY";
    setGrafici();
}

function set5Min() {
    valoreIntervallo = 5;
    tempoIntervallo = "MINUTE";
    setGrafici();
}

function set30Min() {
    valoreIntervallo = 30;
    tempoIntervallo = "MINUTE";
    setGrafici();
}

function setSettimana() {
    valoreIntervallo = 1;
    tempoIntervallo = "WEEK";
    setGrafici();
}
function setMese() {
    valoreIntervallo = 1;
    tempoIntervallo = "MONTH";
    setGrafici();
}
function setAnno() {
    valoreIntervallo = 1;
    tempoIntervallo = "YEAR";
    setGrafici();
}

document.addEventListener("DOMContentLoaded", async function () {
    setGrafici();
    // Riduci la frequenza di polling a 3 secondi ed evita chiamate sovrapposte
    let caricamentoDatiInCorso = false;
    setInterval(() => {
        if (caricamentoDatiInCorso) return;
        caricamentoDatiInCorso = true;
        setGrafici().finally(() => { caricamentoDatiInCorso = false; });
    }, 3000);
});

