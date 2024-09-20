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

            // Skip SMA calculation for low data scenarios
            if (inquinanteValoriFiltered.length > 40 && tempoIntervallo !== "HOUR" && tempoIntervallo !== "DAY") {
                inquinanteValoriFiltered = calculateSMA(inquinanteValoriFiltered, 20);
            }

            let ctx = document.getElementById(`grafico_${inquinante}`);
            let nomeGrafico = `grafico${inquinante}`;

            let limiteArray;
            if (limitiLegge[inquinante] != null) {
                limiteArray = Array(inquinanteValoriFiltered.length).fill(limitiLegge[inquinante]);
            } else {
                limiteArray = Array(inquinanteValoriFiltered.length).fill(null);
            }

            const limite = {
                label: 'Limite',
                data: limiteArray,
                borderDash: [2, 2], // Dashed line style
                pointRadius: 0,
                pointHitRadius: 0,
                pointHoverRadius: 0,
                borderColor: '#D76F65',
            };

            // Adjust the chart options for better display of low data
            let chartOptions = {
                animation: {
                    duration: 0 // general animation time
                },
                hover: {
                    animationDuration: 0 // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
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
                        ticks: {
                            autoSkip: true,
                        }
                    },
                    y: {
                        // beginAtZero: true,
                        ticks: {
                            callback: function (value, index, values) {
                                return `${value.toFixed(2)} ${unitaAsseY[inquinante]}`;
                            }
                        },
                    }
                }
            };

            // Update or create chart with these options
            if (grafici[nomeGrafico]) {
                grafici[nomeGrafico].destroy();
            }

            // Create new chart with the options
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

            if (isChromium || isSafari) {
                if (ctx.parentElement.classList.contains("parteParametriAmbientali")) {
                    ctx.style.marginBottom = "60px";
                    ctx.nextElementSibling.style.marginTop = "-60px";
                } else {
                    ctx.style.marginBottom = "30px";
                }
            }
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

