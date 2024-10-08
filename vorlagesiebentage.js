// Helper function to get the date for 'n' days ago in 'YYYY-MM-DD' format
function getDateNDaysAgo(n) {
    const date = new Date();
    date.setDate(date.getDate() - n);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate hourly labels from 0 to 23 for the X-axis
function getHourlyLabels() {
    return Array.from({ length: 24 }, (_, i) => `${i}:00`);
}

// Function to fetch data for a specific date
async function fetchDataForDate(date) {
    const apiUrl = `https://etl.mmp.li/WheelyWeather/etl/unload.php?location=Bern&date=${date}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

// Function to fetch data for the last seven days
async function fetchLastSevenDaysData() {
    const promises = [];
    for (let i = 0; i < 7; i++) {
        const date = getDateNDaysAgo(i);
        promises.push(fetchDataForDate(date));
    }
    const dataArray = await Promise.all(promises);
    return dataArray;
}

// Function to calculate the average of seven days' data
function calculateAverages(dataArray) {
    const hourlyLabels = getHourlyLabels();
    const avgTemperatures = Array(24).fill(0);
    const avgVehiclesInUse = Array(24).fill(0);
    const avgRain = Array(24).fill(0);

    // Summing up the data for each of the seven days
    dataArray.forEach((data) => {
        data.forEach((item, index) => {
            if (index < 24) {
                avgTemperatures[index] += item.temperature_2m !== undefined ? item.temperature_2m : 0;
                const vehiclesAvailable = item.vehicles_available !== undefined ? item.vehicles_available : 0;
                avgVehiclesInUse[index] += 50 - vehiclesAvailable; // Assuming max 50 Publibikes
                avgRain[index] += item.rain !== undefined ? item.rain : 0;
            }
        });
    });

    // Calculate the average by dividing by 7
    for (let i = 0; i < 24; i++) {
        avgTemperatures[i] /= 7;
        avgVehiclesInUse[i] /= 7;
        avgRain[i] /= 7;
    }

    return { hourlyLabels, avgTemperatures, avgVehiclesInUse, avgRain };
}

// Function to initialize the chart
async function initChart() {
    const dataArray = await fetchLastSevenDaysData();
    const { hourlyLabels, avgTemperatures, avgVehiclesInUse, avgRain } = calculateAverages(dataArray);

    // Create chart
    const ctx = document.getElementById('averageWeatherChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyLabels, // X-axis labels (0-23 hours)
            datasets: [
                {
                    label: 'Average temperature (°C)',
                    data: avgTemperatures, // Average temperature data
                    borderColor: '#FE4B01', // Orange for temperature
                    backgroundColor: 'rgba(254, 75, 1, 0.2)', // Lighter orange
                    fill: true,
                    yAxisID: 'tempY', // Separate Y-axis for temperature on the left
                },
                {
                    label: 'Average rain (mm)',
                    data: avgRain, // Average rain data
                    borderColor: '#FBB108', // Yellow for rain
                    backgroundColor: 'rgba(251, 177, 8, 0.2)',
                    fill: false,
                    yAxisID: 'rainY', // Separate Y-axis for rain on the left
                },
                {
                    label: 'Average of used Publibikes',
                    data: avgVehiclesInUse, // Average used vehicles (Benutzte Fahrzeuge)
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
                        text: 'Temperature (°C)'
                    },
                    min: 0,  // Minimum temperature
                    max: Math.max(...avgTemperatures),  // Set maximum dynamically based on the data
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
                        text: 'Rain (mm)'
                    },
                    min: 0,  // Minimum rain
                    max: Math.max(...avgRain),  // Set maximum dynamically based on the data
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
                        text: 'Used Publibikes'
                    },
                    min: 0,  // Minimum used vehicles
                    max: Math.max(...avgVehiclesInUse),  // Set maximum dynamically based on the data
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
