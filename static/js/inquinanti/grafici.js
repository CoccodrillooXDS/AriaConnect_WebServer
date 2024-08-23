document.addEventListener("DOMContentLoaded", async function () {

    const ctx = document.getElementById("grafico_NO2");

    new Chart(ctx, {
      type: 'line',
      data: {

        datasets: [{
          data: [
            {x: '2024-08-20 08:00:00', y: 23},
            {x: '2024-08-20 09:00:00', y: 25},
            {x: '2024-08-20 10:00:00', y: 27},
            {x: '2024-08-20 11:00:00', y: 26},
            {x: '2024-08-20 12:00:00', y: 29},
            {x: '2024-08-20 13:00:00', y: 31},
            {x: '2024-08-20 14:00:00', y: 30},
            {x: '2024-08-20 15:00:00', y: 32},
            {x: '2024-08-20 16:00:00', y: 33},
            {x: '2024-08-20 17:00:00', y: 35},
            {x: '2024-08-20 18:00:00', y: 34},
            {x: '2024-08-20 19:00:00', y: 32},
            {x: '2024-08-20 20:00:00', y: 30},
            {x: '2024-08-20 21:00:00', y: 28},
            {x: '2024-08-20 22:00:00', y: 27},
            {x: '2024-08-20 23:00:00', y: 25},
            {x: '2024-08-21 00:00:00', y: 23},
            {x: '2024-08-21 01:00:00', y: 22},
            {x: '2024-08-21 02:00:00', y: 21},
            {x: '2024-08-21 03:00:00', y: 20}
          ],  
          borderWidth: 1,
          backgroundColor: '#000000',
          borderColor: '#ffffff',
          labels: ["valore", "data"]
        }]
      },


      
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });


});


// myChart.data.datasets[0].data.push(40);

// // Aggiornare il grafico
// myChart.update();