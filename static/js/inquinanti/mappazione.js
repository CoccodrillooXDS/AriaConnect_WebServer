// Initial coordinates and map settings
const DEFAULT_LAT = 45.556943047717084;
const DEFAULT_LON = 10.217275958492516;
const ZOOM_DEFAULT = 18;
const ZOOM_NOT_AVAILABLE = 5;

let map;
let tileLayer;
let isCityAvailable = true;

// Initialize the map with default or current settings
async function initializeMap() {
    const zoomLevel = isCityAvailable ? ZOOM_DEFAULT : ZOOM_NOT_AVAILABLE;

    if (!map) {
        map = L.map('map', { gestureHandling: true }).setView([DEFAULT_LAT, DEFAULT_LON], zoomLevel);
    } else {
        map.setView([DEFAULT_LAT, DEFAULT_LON], zoomLevel);
    }

    if (!tileLayer) {
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }
}

// Get marker color based on air quality level
function getColorForAirQuality(level) {
    switch (level) {
        case 1: return 'green';
        case 2: return 'yellow';
        case 3: return 'orange';
        default: return 'red';
    }
}

// Add a marker to the map with a popup
function addMarker(airQualityLevel, airQuality, latitude, longitude) {
    const color = getColorForAirQuality(airQualityLevel);

    const customMarker = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const marker = L.marker([latitude, longitude], { icon: customMarker }).addTo(map);
    marker.bindPopup(`${airQuality}<br>${latitude}, ${longitude}`);
}

// Fetch position and air quality data
async function fetchPosition(param) {
    try {
        const response = await fetch('/api/GPS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parametro: param })
        });

        if (!response.ok) {
            throw new Error('Request error');
        }

        const data = await response.json();

        if ((data.longitudine == null || data.longitudine == "Dati GPS non validi") && (data.latitudine == null || data.latitudine == "Dati GPS non validi")) {
            text = "GPS spento";
            elementi.statoGPS.innerText = text;
            document.getElementById("map").style.display = "none";
        } else {
            console.log(data.longitudine, data.latitudine);
            addMarker(data.air_quality_level, data.air_quality, data.latitudine, data.longitudine);
            elementi.statoGPS.innerText = "LAT: " + data.latitudine + " LON: " + data.longitudine;
            try {
                document.getElementById("map").removeAttribute("style");
            } catch (error) { }
        }
    } catch (error) {
        //console.error('Error:', error);
        text = "Dati GPS non disponibili";
        elementi.statoGPS.innerText = text;
        document.getElementById("map").style.display = "none";
    }
}

// Set up periodic data fetching and map initialization
document.addEventListener("DOMContentLoaded", async function () {
    elementi = {
        statoGPS: document.getElementById("statoGPS"),
    }
    await initializeMap();
    await fetchPosition(1);
    setInterval(() => fetchPosition(1), 20000); // Fetch position every 10 seconds
});
