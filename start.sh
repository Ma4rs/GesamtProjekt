#!/bin/bash

# In den develop-Branch wechseln (weil wir aktuell in develop arbeiten bei merge mit main muss es auf main geändert werden)
git checkout develop
# Pakete holen
npm i
# In das Webservice-Verzeichnis wechseln und .NET-Projekt starten
start http://127.0.0.1:5500/Games/Interface/
start http://127.0.0.1:5105/swagger
cd Webservice || { echo "Verzeichnis 'Webservice' nicht gefunden!"; exit 1; }
dotnet run