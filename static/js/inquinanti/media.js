addEventListener("DOMContentLoaded", (event)=>{

    const nomiValori = ["CO", "CO2", "PM10", "NH3", "NO2", "TVOC"]
    const possibiliIntervalli = ["HOUR", "DAY", "WEEK", "MONTH", "YEAR"]
    const elementi ={
        "NO2":{
            "mediaHOUR":document.getElementById("media_oraria_NO2"),
            "mediaDAY":document.getElementById("media_giornaliera_NO2"),
            "mediaWEEK":document.getElementById("media_settimanale_NO2"),
            "mediaMONTH":document.getElementById("media_mensile_NO2"),
            "mediaYEAR":document.getElementById("media_annuale_NO2")
        },
        "PM10":{
            "mediaHOUR":document.getElementById("media_oraria_PM10"),
            "mediaDAY":document.getElementById("media_giornaliera_PM10"),
            "mediaWEEK":document.getElementById("media_settimanale_PM10"),
            "mediaMONTH":document.getElementById("media_mensile_PM10"),
            "mediaYEAR":document.getElementById("media_annuale_PM10")
        },
        "NH3":{
            "mediaHOUR":document.getElementById("media_oraria_NH3"),
            "mediaDAY":document.getElementById("media_giornaliera_NH3"),
            "mediaWEEK":document.getElementById("media_settimanale_NH3"),
            "mediaMONTH":document.getElementById("media_mensile_NH3"),
            "mediaYEAR":document.getElementById("media_annuale_NH3")
        },
        "CO":{
            "mediaHOUR":document.getElementById("media_oraria_CO"),
            "mediaDAY":document.getElementById("media_giornaliera_CO"),
            "mediaWEEK":document.getElementById("media_settimanale_CO"),
            "mediaMONTH":document.getElementById("media_mensile_CO"),
            "mediaYEAR":document.getElementById("media_annuale_CO")
        },
        "TVOC":{
            "mediaHOUR":document.getElementById("media_oraria_TVOC"),
            "mediaDAY":document.getElementById("media_giornaliera_TVOC"),
            "mediaWEEK":document.getElementById("media_settimanale_TVOC"),
            "mediaMONTH":document.getElementById("media_mensile_TVOC"),
            "mediaYEAR":document.getElementById("media_annuale_TVOC")
        },
        "CO2":{
            "mediaHOUR":document.getElementById("media_oraria_CO2"),
            "mediaDAY":document.getElementById("media_giornaliera_CO2"),
            "mediaWEEK":document.getElementById("media_settimanale_CO2"),
            "mediaMONTH":document.getElementById("media_mensile_CO2"),
            "mediaYEAR":document.getElementById("media_annuale_CO2")
        }
    }


    async function fetchAllAverages() {
        try {
            const response = await fetch('/api/all_averages', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error in request');
            }
            const data = await response.json();
            console.log(data);
            updateAllElements(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updateAllElements(data) {
        nomiValori.forEach((inquinante) => {
            possibiliIntervalli.forEach((valoreIntervallo) => {
                const nomeElemento = `media${valoreIntervallo}`;
                const value = data[`${inquinante}_${valoreIntervallo}`];
                if (elementi[inquinante][nomeElemento]) {
                    elementi[inquinante][nomeElemento].innerText = value ? value + " ppm" : "N/A";
                }
            });
        });
    }

    fetchAllAverages();
})

