<?php

// Datenbankkonfiguration einbinden
require_once 'config.php';

// Header setzen, um JSON-Inhaltstyp zurückzugeben
header('Content-Type: application/json');

// Den Standortparameter aus der URL holen
if (isset($_GET['location'])) {
    $location = $_GET['location'];
} else {
    $location = '';
}

// Überprüfen, ob der Standortparameter angegeben wurde
if (empty($location)) {
    echo json_encode(['error' => 'Standortparameter wird benötigt.']);
    exit;
}

try {
    // Erstellt eine neue PDO-Instanz mit der Konfiguration aus config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    //TODO SQL-Query, um Daten basierend auf dem Standort auszuwählen, sortiert nach Zeitstempel (falls vorhanden)
    //Passe das SELECT Statement an, dass die Daten der letzten 3 Tage geladen werden
    $sql = "SELECT * 
    FROM BikeStationsWeather 
    WHERE city = ? 
    AND created_at >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
    ORDER BY created_at DESC";

    // Bereitet die SQL-Anweisung vor
    $stmt = $pdo->prepare($sql);

    // Führt die Abfrage mit der Standortvariablen aus, die in einem Array übergeben wird
    $stmt->execute([$location]);

    // Holt alle passenden Einträge
    $results = $stmt->fetchAll();

    // Überprüfen, ob Ergebnisse gefunden wurden
    if (!$results) {
        echo json_encode(['message' => 'Keine Daten für den angegebenen Standort gefunden.']);
    } else {
        // Gibt die Ergebnisse im JSON-Format zurück
        echo json_encode($results);
    }
} catch (PDOException $e) {
    // Gibt eine Fehlermeldung zurück, wenn etwas schiefgeht
    echo json_encode(['error' => $e->getMessage()]);
}

?>
