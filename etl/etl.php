<?php
// Include the config file for database connection settings
require_once 'config.php';


$cities = [
    [
        'name' => 'Zürich HB',
        'id' => 513,
        'latitude' => 47.37934,
        'longitude' => 8.531721
    ],
    [
        'name' => 'Bern HB',
        'id' => 217,
        'latitude' => 46.94867,
        'longitude' => 7.43746
    ],
    [
        'name' => 'Lausanne HB',
        'id' => 28,
        'latitude' => 47.54364,
        'longitude' => 7.59994
    ],
    [
        'name' => 'Lugano HB',
        'id' => 706,
        'latitude' => 46.00496,
        'longitude' => 8.94717
    ]
];



// Function to fetch bike data from Publibike API
function fetchbikedatapublibike($id) {
    $url = "https://api.publibike.ch/v1/public/stations/" . $id;

    // Initialize a cURL session
    $ch = curl_init($url);

    // Set options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute the cURL session and get the content
    $response = curl_exec($ch);

    // Close the cURL session
    curl_close($ch);

    // Decode the JSON response and return data
    return json_decode($response, true);
}

// Function to fetch weather data from Open Meteo API
function fetchweatherdata($lat,$lon) {
    $url = "https://api.open-meteo.com/v1/forecast?latitude=" . $lat . "&longitude=" . $lon . "&current=temperature_2m,relative_humidity_2m,rain,weather_code";

    // Initialize a cURL session
    $ch = curl_init($url);

    // Set options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute the cURL session and get the content
    $response = curl_exec($ch);

    // Close the cURL session
    curl_close($ch);

    // Decode the JSON response and return data
    return json_decode($response, true);
}



try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$stmt = $pdo->prepare("
INSERT INTO BikeStationsWeather (state_id, state_name, city, vehicles_available, network_id, network_name, latitude, longitude, elevation, rain, temperature_2m) VALUES (:state_id, :state_name, :city, :vehicles_available, :network_id, :network_name, :latitude, :longitude, :elevation, :rain, :temperature_2m)");



foreach($cities as $city) {
    $wetter = fetchweatherdata($city['latitude'], $city['longitude']);
    $bike = fetchbikedatapublibike($city['id']);

    /*$stmt->execute([
        ':state_id' => 'sdfsdf',
        ':state_name' => 'sdfdsfs',
        ':city' => 'sdfdsfds',
        ':vehicles_available' => 6622,
        ':network_id' => '',
        ':network_name' => '',
        ':latitude' => 34324.2342, // from weather data
        ':longitude' => 34324.2342, // from weather data
        ':elevation' => 34324.2342, // from weather data
        ':rain' => 34324.2342, // from weather data
        ':temperature_2m' => 34324.2342, // from weather data
    ]);*/

    
    $stmt->execute([
        ':state_id' => $bike['state']['id'],
        ':state_name' => $bike['state']['name'],
        ':city' => $bike['city'],
        ':vehicles_available' => count($bike['vehicles']),
        ':network_id' => $bike['network']['id'],
        ':network_name' => $bike['network']['name'],
        ':latitude' => $wetter['latitude'], // from weather data
        ':longitude' => $wetter['longitude'], // from weather data
        ':elevation' => $wetter['elevation'], // from weather data
        ':rain' => $wetter['current']['rain'], // from weather data
        ':temperature_2m' => $wetter['current']['temperature_2m'], // from weather data
    ]);

};

echo 'Success!!';
?>
