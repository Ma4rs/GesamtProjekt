// Token des Spielers aus dem localStorage holen (wird zur Authentifizierung verwendet)
let player = localStorage.getItem("token");

// Anfangswerte fürs Geld und den Einsatz
let playerMoney = 0;
let betAmount = 0;

// Spielerkarten und Dealerkarten
let playerHand = [];
let dealerHand = [];

// Punktestände
let playerScore = 0;
let dealerScore = 0;

// DOM-Elemente für die Anzeige im Spiel
const betContainer = document.getElementById("bet");
const betText = betContainer.querySelector(".einsatz-text");
const einsatzWert = document.getElementById("einsatzWert");
const dealerArea = document.querySelector(".absolute.top-16.w-full.flex.justify-center.z-10 > div.flex.items-start.gap-6.relative");
const playerSlot = document.getElementById("player");
const controls = document.querySelector(".absolute.bottom-4.w-full.flex.justify-center.gap-4.z-10");

// Buttons für Spielaktionen
const btnCard = controls.querySelector("button.btn-success");
const btnStand = controls.querySelector("button.btn-warning");

// Einsatz-Chips + Reset-Button
const chipButtons = document.querySelectorAll("#chips button");
const btnDel = document.getElementById("btnDel");

// Zu Beginn: Buttons für Aktionen deaktivieren
btnCard.disabled = true;
btnStand.disabled = true;

/* ----------- Server-Interaktionen ----------- */

// Startkarten vom Backend holen (2 für Spieler, 2 für Dealer)
async function fetchStartCards() {
    const res = await fetch(`http://${window.location.hostname}:5105/api/blackjack/startCard`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${player}` }
    });
    return await res.json();
}

// Eine neue Karte ziehen
async function fetchDealCard() {
    const res = await fetch(`http://${window.location.hostname}:5105/api/blackjack/dealCard`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${player}` }
    });
    return await res.json();
}

// Spiel beenden → Backend bereinigt den Kartenstapel
async function resetBackendDeck() {
    await fetch(`http://${window.location.hostname}:5105/api/blackjack/GameOver`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${player}` }
    });
}

// Credits des Spielers vom Server abrufen
async function getCredits() {
    try {
        const response = await fetch(`http://${window.location.hostname}:5105/api/user/getData`, {
            method: "GET",
            headers: { Authorization: `Bearer ${player}` }
        });
        if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
        const userData = await response.json();
        return userData.credits ?? 0;
    } catch (error) {
        console.error("Fehler beim Laden des Bankwerts:", error);
        return 0;
    }
}

// Credits im Backend aktualisieren (nach Spielende)
async function updateCredits(amount) {
    try {
        await fetch(`http://${window.location.hostname}:5105/api/user/updateCredits`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${player}`
            },
            body: JSON.stringify({ creditsToAdd: amount })
        });
    } catch (error) {
        console.error("Fehler beim POST an updateCredits:", error);
    }
}


// Spiel initialisieren: Credits holen, UI updaten, Kartenfelder leeren
async function initialize() {
    playerMoney = await getCredits();
    updateBetText();
    updatePlayerMoneyDisplay();
    clearCards();
}

// Guthaben-Anzeige im Spiel aktualisieren
function updatePlayerMoneyDisplay() {
    const display = document.getElementById("playerMoneyDisplay");
    if (display) {
        display.textContent = `Guthaben: ${playerMoney}`;
    }
}

// Benachrichtigung anzeigen (z. B. Gewinn/Verlust)
function showNotification(msg, btnTxt, redirectUrl) {
    // Vorherige Benachrichtigung entfernen (falls vorhanden)
    let oldContainer = document.getElementById('notificationContainer');
    if (oldContainer) oldContainer.remove();

    // Hintergrundcontainer
    let container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background-color: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
    `;

    // Box mit Nachricht und Button
    let box = document.createElement('div');
    box.style = `
        background-color: #1f2937;
        color: #fff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        text-align: center;
        max-width: 300px;
    `;

    let text = document.createElement('p');
    text.innerText = msg;
    text.style = "font-size: 1.2rem; margin-bottom: 20px;";

    let button = document.createElement('button');
    button.innerText = btnTxt;
    button.style = `
        background-color: #10b981;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    `;
    button.onclick = () => {
        if (redirectUrl == "../Interface/credits.html") {
            window.top.location.href = redirectUrl;
        }
        window.location.href = redirectUrl;
    };

    box.appendChild(text);
    box.appendChild(button);
    container.appendChild(box);
    document.body.appendChild(container);
}


// Eine Karte ins UI einfügen (Spieler oder Dealer)
function renderCard(card, area, faceUp = true) {
    const img = document.createElement("img");
    img.src = faceUp ? card.image : "/Picture/Karten/Hinterseite.png";
    img.alt = `${card.rank} of ${card.suit}`;
    img.classList.add("card");

    // Unterschiedliche Behandlung für Dealer und Spieler
    if (area === dealerArea) {
        const placeholderContainer = dealerArea.querySelector("#dealerPlaceholders");
        const stapelContainer = dealerArea.querySelector("#stapelContainer");
        const slots = placeholderContainer?.querySelectorAll(".card-slot") ?? [];
        const currentCards = placeholderContainer?.querySelectorAll("img.card").length ?? 0;

        if (currentCards < 2 && slots[currentCards]) {
            slots[currentCards].innerHTML = "";
            slots[currentCards].appendChild(img);
        } else {
            let extra = document.getElementById("dealerExtraCards");
            if (!extra) {
                extra = document.createElement("div");
                extra.id = "dealerExtraCards";
                extra.className = "flex gap-2 ml-2";
                stapelContainer.insertAdjacentElement("beforebegin", extra);
            }
            extra.appendChild(img);
        }
    } else {
        const slots = area.querySelectorAll(".card-slot");
        const currentCards = area.querySelectorAll("img.card").length;

        if (currentCards < 2 && slots[currentCards]) {
            slots[currentCards].innerHTML = "";
            slots[currentCards].appendChild(img);
        } else {
            area.appendChild(img);
        }
    }
}

// Alle Karten vom Spielfeld entfernen und Slots zurücksetzen
function clearCards() {
    dealerHand = [];
    playerHand = [];

    playerSlot.innerHTML = "";
    for (let i = 0; i < 2; i++) {
        const slot = document.createElement("div");
        slot.className = "card-slot";
        playerSlot.appendChild(slot);
    }

    const placeholderContainer = dealerArea.querySelector("#dealerPlaceholders");
    if (placeholderContainer) {
        placeholderContainer.innerHTML = "";
        for (let i = 0; i < 2; i++) {
            const slot = document.createElement("div");
            slot.className = "card-slot";
            placeholderContainer.appendChild(slot);
        }
    }

    const extraDealerCards = document.getElementById("dealerExtraCards");
    if (extraDealerCards) extraDealerCards.remove();
}

// Kartenwert berechnen (Ass kann 1 oder 11 zählen)
function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (const card of hand) {
        score += card.value;
        if (card.rank === "ace") aces++;
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

// Punkte aktualisieren nach jeder Aktion
function updateScores() {
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);
}

// Einsatz-Anzeige aktualisieren
function updateBetText() {
    einsatzWert.textContent = `${betAmount}`;
    updatePlayerMoneyDisplay();
}

// Spiel starten: Karten ziehen, anzeigen, Spielbuttons aktivieren
async function startGame() {
    if (betAmount <= 0) {
        showNotification("Bitte Einsatz wählen.", "Okay", "");
        return;
    }

    if (betAmount > playerMoney) {
        showNotification("Du hast nicht genug Guthaben!", "Okay", "");
        return;
    }

    playerMoney -= betAmount;
    updatePlayerMoneyDisplay();
    chipButtons.forEach(c => c.disabled = true);
    betContainer.style.pointerEvents = "none";

    clearCards();
    await resetBackendDeck();

    const cards = await fetchStartCards();
    playerHand = [cards[0], cards[1]];
    dealerHand = [cards[2], cards[3]];

    renderCard(playerHand[0], playerSlot, true);
    renderCard(playerHand[1], playerSlot, true);
    renderCard(dealerHand[0], dealerArea, true);
    renderCard(dealerHand[1], dealerArea, false);

    updateScores();

    btnCard.disabled = false;
    btnStand.disabled = false;

    if (playerScore === 21) await stand(); // Sofortiger Blackjack
}

// Spieler zieht Karte
async function playerHit() {
    const card = await fetchDealCard();
    playerHand.push(card);
    renderCard(card, playerSlot, true);
    updateScores();
    await sleep(1000);
    if (playerScore > 21) {
        await sleep(500);
        await endGame("Du verlierst.");
    }
}

// Spieler steht, jetzt ist der Dealer dran
async function stand() {
    btnCard.disabled = true;
    btnStand.disabled = true;

    const dealerCards = dealerArea.querySelectorAll("img.card");
    if (dealerCards.length > 1) {
        dealerCards[1].src = dealerHand[1].image;
        await sleep(800);
    }

    updateScores();

    while (dealerScore < 17) {
        await sleep(1000);
        const card = await fetchDealCard();
        dealerHand.push(card);
        renderCard(card, dealerArea, true);
        updateScores();
    }

    await sleep(1000);

    if (dealerScore > 21) {
        await endGame("Dealer bust! Du gewinnst.");
    } else if (dealerScore > playerScore) {
        await endGame("Du verlierst!");
    } else if (dealerScore < playerScore) {
        await endGame("Du gewinnst!");
    } else {
        await endGame("Unentschieden.");
    }
}

// Spiel beenden, Gewinner festlegen, Guthaben anpassen, neu starten oder Credits-Seite
async function endGame(msg) {
    const won = msg.includes("gewinnst");
    const draw = msg.includes("Unentschieden");

    if (won) {
        playerMoney += betAmount * 2;
        await updateCredits(betAmount);
        showNotification("Du hast gewonnen!", "Nochmal spielen", window.location.href);
    } else if (draw) {
        playerMoney += betAmount;
        await updateCredits(0);
        showNotification("Unentschieden!", "Nochmal spielen", window.location.href);
    } else {
        await updateCredits(-betAmount);
        if (playerMoney <= 0) {
            playerMoney = 0;
            showNotification("Keine Credits mehr!", "Credits aufladen", "../Interface/credits.html");
        } else {
            showNotification("Leider verloren!", "Nochmal spielen", window.location.href);
        }
    }

    betAmount = 0;
    updateBetText();
    chipButtons.forEach(c => c.disabled = false);
    betContainer.style.pointerEvents = "auto";
    btnCard.disabled = true;
    btnStand.disabled = true;
    clearCards();
}

// Einfacher Sleep-Timer
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event-Handler
// Klick auf Einsatzchips
chipButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.textContent?.replace(/\n/g, "").trim() ?? "";
        if (val === "ALL") {
            betAmount = playerMoney;
        } else {
            const amount = parseInt(val || "0");
            if (!isNaN(amount) && betAmount + amount <= playerMoney) {
                betAmount += amount;
            }
        }
        updateBetText();
    });
});

// Einsatz löschen
btnDel.addEventListener("click", () => {
    betAmount = 0;
    updateBetText();
});

// Einsatzfeld starten das Spiel
betContainer.addEventListener("click", () => startGame());

// Buttons für Karten ziehen oder stehen bleiben
btnCard.addEventListener("click", playerHit);
btnStand.addEventListener("click", stand);

// Initialisierung beim Laden der Seite
initialize();
