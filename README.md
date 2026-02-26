# OnlineCasino

## Projektbeschreibung

Dieses Projekt ist ein Onlinecasino, das urspruenglich im Rahmen eines Schulprojektes von drei Schuelern entwickelt wurde. Ziel war es, verschiedene klassische Casinospiele digital umzusetzen und dabei Programmierkenntnisse in Webentwicklung und Backend-Programmierung zu vertiefen.

Das Schulprojekt ist abgeschlossen, aber ab und zu werden kleinere Features oder Verbesserungen hinzugefuegt.

## Spiele

- **Blackjack** -- Erreiche 21 Punkte oder komme so nah wie moeglich dran, ohne drueber zu gehen.
- **Roulette** -- Setze auf Zahlen, Farben oder Bereiche und hoffe, dass die Kugel richtig faellt.
- **Triple Guess** -- Errate drei Karten hintereinander (Farbe, Hoeher/Niedriger, Inside/Outside).
- **Ladder of Risk** -- Klettere die Gewinnleiter hinauf und entscheide, wann du auszahlst.

## Tech-Stack

**Frontend:** HTML, CSS, JavaScript, Tailwind CSS, DaisyUI

**Backend:** .NET 8.0 (ASP.NET Core Web API), Entity Framework Core, SQL Server

**Auth:** JWT-Authentifizierung, BCrypt Passwort-Hashing

## Verzeichnisstruktur

```
Games/          Frontends der Casinospiele + Interface-Seiten
Webservice/     .NET Backend (API-Controller, Datenbankmodelle)
Picture/        Bilder, Kartensets, Logo, Willkommensvideo
```

## Starten der Anwendung

1. **Repository klonen:**
   ```bash
   git clone https://gl.edvschule-plattling.de/bfs2023ik/202425trfiaeb2/onlinecasino.git
   ```

2. **Startskript ausfuehren:**
   ```bash
   ./start.sh
   ```
   Das Skript installiert alle Abhaengigkeiten und startet sowohl den Live-Server (Port 5500) als auch das Backend (Port 5105). Beim ersten Start muss einmal mit `y` bestaetigt werden.

## Lizenz

Dieses Projekt dient ausschliesslich zu Lernzwecken. Eine kommerzielle Nutzung ist ausgeschlossen.
