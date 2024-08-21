document.addEventListener("DOMContentLoaded", function() {
    // Inizializza la mappa e imposta le coordinate iniziali e il livello di zoom
    var map = L.map('map').setView([41.9028, 12.4964], 13); // Roma, Italia

    // Aggiungi una tile layer (sfondo della mappa) da OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Aggiungi un marker alla mappa
    var marker = L.marker([41.9028, 12.4964]).addTo(map)
        .bindPopup('Roma, Italia')
        .openPopup();
});