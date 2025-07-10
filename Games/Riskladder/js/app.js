// Wenn das DOM vollständig geladen ist, hole Bankwert und zeichne die Gewinnleiter
document.addEventListener("DOMContentLoaded", async function () {
    await fetchBankValue();   // Aktuelles Guthaben vom Server holen
    renderLadder();           // Gewinnleiter basierend auf aktuellem Einsatz zeichnen
});

// Globale Spielvariablen
let bet = 0;                  // Aktuell gesetzter Einsatz
let currentStep = 0;          // Aktuelle Position auf der Leiter
let maxStep = 0;              // Höchste mögliche Stufe, bevor man verliert
let balance = 0;              // Aktueller Kontostand des Spielers
let gameStarted = false;      // Ob das Spiel aktiv ist oder nicht

// Multiplikatoren je Stufe der Gewinnleiter
const multipliers = [0, 1.0, 1.2, 1.5, 1.8, 2.2, 2.5];

// Holt das aktuelle Guthaben des Spielers vom Backend
async function fetchBankValue() {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get(`http://${window.location.hostname}:5105/api/user/getData`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        balance = Number(response.data.credits);
        document.querySelector("#balanceDisplay").innerHTML = balance;
        return balance;
    } catch (error) {
        console.error("Fehler beim Laden des Bankwerts:", error);
        return 0;
    }
}

// Aktualisiert das Guthaben auf dem Server (z.B. nach Wetteinsatz oder Gewinn)
async function updateCredits(amount) {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.post(`http://${window.location.hostname}:5105/api/user/updateCredits`, {
            creditsToAdd: amount
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        balance = response.data.newCredits;
        document.querySelector("#balanceDisplay").innerHTML = balance;
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Credits:", error);
    }
}

// Zeigt den aktuellen Einsatz im UI an
function updateBetDisplay() {
    document.querySelector("#betDisplay").innerHTML = bet;
}

// Zeichnet die Gewinnleiter mit allen möglichen Stufen
function renderLadder() {
    const ladder = document.getElementById("ladder");
    ladder.innerHTML = ""; // Vorherige Stufen entfernen

    for (let i = 0; i < multipliers.length; i++) {
        const value = i === 0 ? 0 : Math.floor(bet * multipliers[i]);
        const step = document.createElement("div");
        step.className = "ladder-step";

        // Markiere aktive oder inaktive Stufen abhängig vom Spielstatus
        if (i === currentStep && gameStarted) {
            step.classList.add("active");
        } else if (!gameStarted) {
            step.classList.add("inactive");
        }

        step.innerText = `${value} Credits`;
        ladder.appendChild(step);
    }
}

// Fügt dem Einsatz einen Chipbetrag hinzu (wenn genug Guthaben vorhanden)
async function addBet(amount) {
    if (balance >= amount) {
        bet += amount;
        await updateCredits(-amount);  // Guthaben verringern
        renderLadder();
        updateBetDisplay();
    }
}

// Setzt den Einsatz zurück und gibt ihn dem Spieler zurück
async function clearBet() {
    if (bet > 0) {
        await updateCredits(bet);  // Einsatz zurückzahlen
        bet = 0;
        renderLadder();
        updateBetDisplay();
    }
}

// Setzt den kompletten Kontostand als Einsatz
async function betAll() {
    if (balance > 0) {
        bet += balance;
        await updateCredits(-balance);
        renderLadder();
        updateBetDisplay();
    }
}

// Startet das Spiel: berechnet zufällige Gewinnhöhe und aktiviert Steuerung
function startGame() {
    if (bet <= 0) return alert("Bitte Einsatz platzieren!");
    currentStep = 0;
    maxStep = Math.floor(Math.random() * (multipliers.length - 1)) + 1; // Zufällige Gewinnhöhe
    gameStarted = true;
    renderLadder();

    // Schalte Spiel-Buttons ein
    document.getElementById("riskBtn").disabled = false;
    document.getElementById("collectBtn").disabled = false;
    disableBetAndChips();
}

// Sperrt Chips und Einsatzbuttons nach Spielstart
function disableBetAndChips() {
    document.querySelectorAll('.chip-btn').forEach(btn => btn.disabled = true);
    document.querySelectorAll('.chip-btn.active').forEach(btn => btn.classList.remove('active'));
    const clearBtn = document.getElementById('clear');
    if (clearBtn) clearBtn.style.display = 'none';
}

// Risiko-Klick: Erhöht Stufe oder führt zu Verlust
async function risk() {
    if (bet === 0) return;

    if (currentStep < maxStep) {
        currentStep++;
        renderLadder();

        // Maximaler Gewinn erreicht: automatisch einsammeln
        if (currentStep === multipliers.length - 1) {
            await collect(true);
        }
    } else {
        await collect(false); // Verloren
    }
}

// Spiel beenden und Gewinn einlösen oder Verlust verarbeiten
async function collect(won = true) {
    const win = Math.floor(bet * multipliers[currentStep]); // Gewinn berechnen
    const einsatz = bet;

    bet = 0;
    currentStep = 0;
    gameStarted = false;

    // Buttons deaktivieren
    document.getElementById("riskBtn").disabled = true;
    document.getElementById("collectBtn").disabled = true;

    if (won) {
        await updateCredits(win); // Gewinn auszahlen
        showNotification(`Gewonnen: ${win} Credits!`, "Nochmal spielen", window.location.pathname);
    } else {
        const newBalance = await fetchBankValue(); // Aktuelles Guthaben erneut laden
        if (newBalance <= 0) {
            showNotification("Keine Credits mehr!", "Credits kaufen", "../Interface/credits.html");
        } else {
            showNotification("Verloren!", "Nochmal spielen", window.location.pathname);
        }
    }

    renderLadder();
    updateBetDisplay();
}

// Zeigt Overlay für Gewinn, Verlust oder leeres Konto
function showNotification(msg, btnTxt, redirectUrl) {
    let oldContainer = document.getElementById('container');
    if (oldContainer) oldContainer.remove();

    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');

    let nSpan = document.createElement('span');
    nSpan.setAttribute('class', 'nSpan');
    nSpan.innerText = msg;
    notification.append(nSpan);

    let nBtn = document.createElement('div');
    nBtn.setAttribute('class', 'nBtn');
    nBtn.innerText = btnTxt;

    // Button leitet zur richtigen Seite weiter
    nBtn.onclick = function () {
        if (redirectUrl === "../Interface/credits.html") {
            window.top.location.href = redirectUrl;
        } else {
            window.location.href = redirectUrl;
        }
    };

    let container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.append(container);
    notification.append(nBtn);
    container.prepend(notification);
}
