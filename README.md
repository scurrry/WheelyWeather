# WheelyWeather
 
Verwendete Ressourcen: 
Für die Daten der verschiedenen Publibike-Stationen wurde die Publibike API (https://www.freepublicapis.com/publibike-stations-api) genutzt. Die Wetterdaten stammen aus der Openmeteo API (https://open-meteo.com). Zur Verarbeitung von Datums- und Zeitwerten kamen PHP DateTime und MySQL zum Einsatz. Zudem haben wir mit GitHub Copilot und ChatGPT-4 gearbeitet.

Learnings: 
Das Abrufen und Speichern von API-Daten war ein zentraler Bestandteil unseres Projekts. Wir haben intensiv mit PHP und PHP PDO gearbeitet, insbesondere um doppelte Daten zu vermeiden. Die dynamische Datenvisualisierung mit Chart.js war eine wertvolle Erfahrung, ebenso wie die Fehlerbehandlung bei cURL- und SQL-Anfragen. Zudem konnten wir unser Wissen in CSS und HTML durch erneute Anwendung weiter festigen.

Herausforderungen: 
Wir hatten anfangs geplant, alle Publibike-Stationen der Stadt zusammenzuzählen, aber da die Stationen nur nach einer numerischen ID gelistet waren, konnten wir die 665 unterschiedlichen Stationen in der Schweiz nicht sortieren. Daher entschieden wir uns schliesslich, nur eine Station in der Nähe des Bahnhofs auszuwählen und deren Daten zu verwenden.
Ursprünglich wollten wir oberhalb der Wetterdaten auch die Anzahl der verfügbaren Fahrräder von der Publibike API abrufen. Allerdings stießen wir dabei auf eine Fehlermeldung, da die API nur einzelne Fahrräder auflisten konnte und es keine Möglichkeit gab, die Items zu zählen und diese Zahl auf der Website darzustellen.
Zudem stellte der Umgang mit mehrfachen Datensätzen pro Tag und die Berechnung von Tagesdurchschnittswerten eine Herausforderung dar. Weiterhin war es zeitaufwendig, Fehler im HTML und CSS zu finden und zu beheben.
