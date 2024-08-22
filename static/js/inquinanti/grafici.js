document.addEventListener("DOMContentLoaded", async function () {

    const ctx = document.getElementById("grafico_NO2");

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
          backgroundColor: '#000000',
          borderColor: '#ffffff'
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