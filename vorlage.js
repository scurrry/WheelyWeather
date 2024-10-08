// Fetch data from the API
async function fetchData() {
    try {
        const response = await fetch('https://etl.mmp.li/WheelyWeather/etl/unload.php?location=Bern');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Function to initialize the chart
async function initChart() {
    const data = await fetchData();

    // Prepare data for the chart
    const ids = data.map(item => item.id);
    const temperatures = data.map(item => item.temperature_2m);
    const vehiclesAvailable = data.map(item => item.vehicles_available);

    // Create chart
    const ctx = document.getElementById('wheelyWeatherChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ids, // X-axis labels (IDs)
            datasets: [
                {
                    label: 'Temperatur (°C)',
                    data: temperatures, // Temperature data
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    yAxisID: 'y',
                },
                {
                    label: 'Verfügbare Fahrzeuge',
                    data: vehiclesAvailable, // Available vehicles data
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: true,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperatur (°C)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Verfügbare Fahrzeuge'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Initialize the chart on page load
initChart();
