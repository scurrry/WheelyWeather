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

// Fetch data from the API for the given date
async function fetchData() {
    const yesterday = getYesterdayDate();
    const apiUrl = `https://etl.mmp.li/WheelyWeather/etl/unload.php?location=Bern&date=${yesterday}`;
    
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

// Function to initialize the chart
async function initChart() {
    const data = await fetchData();

    if (!data || data.length === 0) {
        console.error('No data returned from API');
        return;
    }

    const MAX_PUBLIBIKES = 50; // Set the maximum number of Publibikes

    // Assuming the data is returned in order and covers all 24 hours
    const hourlyLabels = getHourlyLabels();
    
    // Map data to temperature, vehicle counts, and rain data
    const temperatures = Array(24).fill(null);
    const vehiclesAvailable = Array(24).fill(null);
    const rainData = Array(24).fill(null); // New array for rain data
    const vehiclesInUse = Array(24).fill(null); // Array for used vehicles (benutzte Fahrzeuge)

    data.forEach((item, index) => {
        if (index < 24) {
            temperatures[index] = item.temperature_2m !== undefined ? item.temperature_2m : null;
            vehiclesAvailable[index] = item.vehicles_available !== undefined ? item.vehicles_available : null;
            rainData[index] = item.rain !== undefined ? item.rain : null;

            // Calculate the used vehicles (benutzte Fahrzeuge)
            vehiclesInUse[index] = MAX_PUBLIBIKES - vehiclesAvailable[index];
        }
    });

    // Calculate the maximum number of used vehicles dynamically
    const maxVehiclesInUse = Math.max(...vehiclesInUse);

    // Calculate the maximum temperature dynamically
    const maxTemperature = Math.max(...temperatures.filter(temp => temp !== null));

    // Calculate the maximum rainfall dynamically
    const maxRain = Math.max(...rainData.filter(rain => rain !== null));

    // Create chart
    const ctx = document.getElementById('wheelyWeatherChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyLabels, // X-axis labels (0-23 hours)
            datasets: [
                {
                    label: 'Temperatur (°C)',
                    data: temperatures, // Temperature data
                    borderColor: '#FE4B01', // Orange for temperature
                    backgroundColor: 'rgba(254, 75, 1, 0.2)', // Lighter orange
                    fill: true,
                    yAxisID: 'tempY', // Separate Y-axis for temperature on the left
                },
                {
                    label: 'Regen (mm)',
                    data: rainData, // Rain data
                    borderColor: '#FBB108', // Yellow for rain
                    backgroundColor: 'rgba(251, 177, 8, 0.2)',
                    fill: false,
                    yAxisID: 'rainY', // Separate Y-axis for rain on the left
                },
                {
                    label: 'Benutzte Fahrzeuge',
                    data: vehiclesInUse, // Used vehicles (Benutzte Fahrzeuge)
                    borderColor: '#FF9B9E', // Pink for used vehicles
                    backgroundColor: 'rgba(255, 155, 158, 0.2)',
                    fill: true,
                    yAxisID: 'y1', // Right Y-axis for used vehicles
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
                tempY: { // Y-axis for temperature
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperatur (°C)'
                    },
                    min: 0,  // Minimum temperature
                    max: maxTemperature,  // Set maximum dynamically based on the data
                    ticks: {
                        stepSize: 2, // Set step size to 2 for temperature
                    }
                },
                rainY: { // Y-axis for rain
                    type: 'linear',
                    display: true,
                    position: 'left', // Also on the left
                    title: {
                        display: true,
                        text: 'Regen (mm)'
                    },
                    min: 0,  // Minimum rain
                    max: maxRain,  // Set maximum dynamically based on the data
                    ticks: {
                        stepSize: 0.5, // Set step size to 0.5 for rain
                    },
                    grid: {
                        drawOnChartArea: false // Prevent overlap with temperature grid
                    }
                },
                y1: { // Y-axis for used vehicles
                    type: 'linear',
                    display: true,
                    position: 'right', // Right Y-axis for used vehicles
                    title: {
                        display: true,
                        text: 'Benutzte Fahrzeuge'
                    },
                    min: 0,  // Minimum used vehicles
                    max: maxVehiclesInUse,  // Set maximum dynamically based on the data
                    ticks: {
                        stepSize: 2, // Set step size to 2 for vehicles in use
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const datasetLabel = tooltipItem.dataset.label || '';
                            const value = tooltipItem.formattedValue || '';
                            if (tooltipItem.datasetIndex === 1) {
                                // Special format for rain data
                                return datasetLabel + ': ' + value + ' mm';
                            }
                            return datasetLabel + ': ' + value;
                        }
                    }
                }
            }
        }
    });
}

// Initialize the chart on page load
initChart();
