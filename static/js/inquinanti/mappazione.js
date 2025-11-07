// Initial coordinates and map settings
const DEFAULT_LAT = 45.556943047717084;
const DEFAULT_LON = 10.217275958492516;
const ZOOM_DEFAULT = 18;
const ZOOM_NOT_AVAILABLE = 5;

let map;
let tileLayer;
let isCityAvailable = true;
// Keep a list of created markers to avoid adding duplicates that are too close
const markersList = [];
// Minimum distance in meters under which a new marker will NOT be added
const MIN_DISTANCE_METERS = 2; // adjust as needed (e.g., 5-20 meters)

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

    // If map or Leaflet not available, bail out
    if (typeof L === 'undefined' || !map) return;

    // Check existing markers for proximity
    try {
        const newLatLng = L.latLng(latitude, longitude);
        for (const existing of markersList) {
            const existingLatLng = existing.getLatLng();
            const dist = newLatLng.distanceTo(existingLatLng); // meters
            if (dist <= MIN_DISTANCE_METERS) {
                // Too close to an existing marker — don't add another
                // Move the map view to the new coordinates anyway
                map.setView([latitude, longitude], ZOOM_DEFAULT);
                // Optionally update popup content or timestamp of existing marker here if needed
                return;
            }
        }
    } catch (e) {
        // If something goes wrong with distance calc, continue to add marker
        console.warn('Proximity check failed, continuing to add marker', e);
    }

    const customMarker = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const marker = L.marker([latitude, longitude], { icon: customMarker }).addTo(map);
    marker.bindPopup(`${airQuality}<br>${latitude}, ${longitude}`);
    // store marker reference for future proximity checks
    markersList.push(marker);
    map.setView([latitude, longitude], ZOOM_DEFAULT);
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

        if ((data.longitudine == null || data.longitudine == "Dati GPS non validi" || data.longitudine == 0) && (data.latitudine == null || data.latitudine == "Dati GPS non validi" || data.latitudine == 0)) {
            text = "Dati GPS non disponibili";
            elementi.statoGPS.innerText = text;
        } else {
            // console.log(data.longitudine, data.latitudine);
            addMarker(data.air_quality_level, data.air_quality, data.latitudine, data.longitudine);
            elementi.statoGPS.innerHTML = "<b>Latitudine:</b> " + data.latitudine + " <b>Longitudine:</b> " + data.longitudine;
        }
    } catch (error) {
        console.error('Error:', error);
        text = "Dati GPS non disponibili";
        elementi.statoGPS.innerText = text;
    }
}

// Set up periodic data fetching and map initialization
document.addEventListener("DOMContentLoaded", async function () {
    elementi = {
        statoGPS: document.getElementById("statoGPS"),
    }
    await initializeMap();
    await fetchPosition(1);
    setInterval(() => fetchPosition(1), 2000); // Fetch position every second
});
