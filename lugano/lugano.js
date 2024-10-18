document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=46.0037&longitude=8.9511&hourly=temperature_2m,rain,weather_code&forecast_days=1';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const temperature = data.hourly.temperature_2m[0];
            const rain = data.hourly.rain[0];
            const weatherCode = data.hourly.weather_code[0];

            document.getElementById('temperature').textContent = `${temperature} °C`;
            document.getElementById('rain').textContent = `${rain} mm`;

            let weatherDescription = '';
            switch (weatherCode) {
                case 0:
                    weatherDescription = 'Clear';
                    break;
                case 1:
                    weatherDescription = 'Mainly clear';
                    break;
                case 2:
                    weatherDescription = 'Partly cloudy';
                    break;
                case 3:
                    weatherDescription = 'Overcast';
                    break;
                default:
                    weatherDescription = 'Clear';
            }
            document.getElementById('weather').textContent = weatherDescription;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('temperature').textContent = 'Error';
            document.getElementById('rain').textContent = 'Error';
            document.getElementById('weather').textContent = 'Error';
        });
});



// Definition von DOM Elementen
const yesterdayButton = document.querySelector("#yesterday");
const threeDaysAgoButton = document.querySelector("#threeDaysAgo");
const oneWeekAgoButton = document.querySelector("#oneWeekAgo");

// Eventlistener für die Buttons
yesterdayButton.addEventListener("click", async () => {
    console.log("Yesterday");
    let url = "https://etl.mmp.li/WheelyWeather/etl/unload.php?location=Capolago&date=";
    const data = await fetchData(url);
    if (!data || data.length === 0) {
        console.error('No data returned from API');
        return;
    }
    updateChartWithNewData(data);
});

threeDaysAgoButton.addEventListener("click", async () => {
    console.log("Three Days Ago");
    let url = "https://etl.mmp.li/WheelyWeather/etl/unloadThreeDays.php?location=Capolago";
    const data = await fetchData(url); // Holt die Daten von vor drei Tagen
    console.log(data);
    
    if (!data || data.length === 0) {
        console.error('No data returned from API');
        return;
    }

    // Aktualisiere das bestehende Diagramm mit den neuen Daten
    updateChartWithNewData(data);
});

// Helper function to get the date for yesterday in 'YYYY-MM-DD' format
function getYesterdayDate() {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate hourly labels from 0 to 23 for the X-axis
function getHourlyLabels() {
    return Array.from({ length: 24 }, (_, i) => `${i}:00`);
}

// Fetch data from the API for different endpoints
async function fetchData(url) {
    const yesterday = getYesterdayDate();
    const apiUrl = `${url}&date=${yesterday}`;
    console.log(apiUrl);
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Function to update the existing chart with new data
function updateChartWithNewData(data) {
    const MAX_PUBLIBIKES = 50; // Maximum Publibikes

    // Assuming the data covers all 24 hours
    const hourlyLabels = getHourlyLabels();
    const temperatures = Array(24).fill(null);
    const vehiclesAvailable = Array(24).fill(null);
    const rainData = Array(24).fill(null);
    const vehiclesInUse = Array(24).fill(null);

    data.forEach((item, index) => {
        if (index < 24) {
            temperatures[index] = item.temperature_2m || null;
            vehiclesAvailable[index] = item.vehicles_available || null;
            rainData[index] = item.rain || null;
            vehiclesInUse[index] = MAX_PUBLIBIKES - vehiclesAvailable[index];
        }
    });

    // Dynamische Maxima berechnen
    const maxTemperature = Math.max(...temperatures);
    const maxRain = Math.max(...rainData);
    const maxVehiclesInUse = Math.max(...vehiclesInUse);

    // Aktualisiere die Daten des bestehenden Charts
    window.myChart.data.labels = hourlyLabels;  // Aktualisiere die Labels
    window.myChart.data.datasets[0].data = temperatures;  // Temperatur-Daten
    window.myChart.data.datasets[1].data = rainData;  // Regen-Daten
    window.myChart.data.datasets[2].data = vehiclesInUse;  // Verfügbare Fahrräder

    // Aktualisiere die Achsenlimits, falls notwendig
    window.myChart.options.scales.tempY.max = maxTemperature;
    window.myChart.options.scales.rainY.max = maxRain;
    window.myChart.options.scales.y1.max = maxVehiclesInUse;

    // Aktualisiere das Diagramm, um die Änderungen anzuzeigen
    window.myChart.update();
}

// Function to initialize the chart on page load
async function initChart() {
    let url = "https://etl.mmp.li/WheelyWeather/etl/unload.php?location=Capolago&date="
    const data = await fetchData(url);

    if (!data || data.length === 0) {
        console.error('No data returned from API');
        return;
    }

    const MAX_PUBLIBIKES = 50; // Maximum Publibikes

    const hourlyLabels = getHourlyLabels();
    const temperatures = Array(24).fill(null);
    const vehiclesAvailable = Array(24).fill(null);
    const rainData = Array(24).fill(null);
    const vehiclesInUse = Array(24).fill(null);

    data.forEach((item, index) => {
        if (index < 24) {
            temperatures[index] = item.temperature_2m || null;
            vehiclesAvailable[index] = item.vehicles_available || null;
            rainData[index] = item.rain || null;
            vehiclesInUse[index] = MAX_PUBLIBIKES - vehiclesAvailable[index];
        }
    });

    const maxTemperature = Math.max(...temperatures);
    const maxRain = Math.max(...rainData);
    const maxVehiclesInUse = Math.max(...vehiclesInUse);

    const ctx = document.getElementById('wheelyWeatherChart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyLabels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: '#FE4B01',
                    backgroundColor: 'rgba(254, 75, 1, 0.2)',
                    fill: true,
                    yAxisID: 'tempY',
                },
                {
                    label: 'Rain (mm)',
                    data: rainData,
                    borderColor: '#FBB108',
                    backgroundColor: 'rgba(251, 177, 8, 0.2)',
                    fill: false,
                    yAxisID: 'rainY',
                },
                {
                    label: 'Used Publibikes',
                    data: vehiclesInUse,
                    borderColor: '#FF9B9E',
                    backgroundColor: 'rgba(255, 155, 158, 0.2)',
                    fill: true,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                tempY: {
                    type: 'linear',
                    position: 'left',
                    min: 0,
                    max: maxTemperature,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                },
                rainY: {
                    type: 'linear',
                    position: 'left',
                    min: 0,
                    max: maxRain,
                    title: {
                        display: true,
                        text: 'Rain (mm)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: maxVehiclesInUse,
                    title: {
                        display: true,
                        text: 'Used Publibikes'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Automatically load the chart when the page loads
window.onload = initChart;
