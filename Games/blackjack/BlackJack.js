let player = localStorage.getItem("token");

let playerMoney = 0;
let betAmount = 0;

// Karten-Array
let playerHand = [];
let dealerHand = [];

let playerScore = 0;
let dealerScore = 0;

const betContainer = document.getElementById("bet");
const betText = betContainer.querySelector(".einsatz-text");
const einsatzWert = document.getElementById("einsatzWert");
const dealerArea = document.querySelector(
    ".absolute.top-16.w-full.flex.justify-center.z-10 > div.flex.items-start.gap-6.relative"
);
const playerSlot = document.getElementById("player");
const controls = document.querySelector(
    ".absolute.bottom-4.w-full.flex.justify-center.gap-4.z-10"
);

const btnCard = controls.querySelector("button.btn-success");
const btnStand = controls.querySelector("button.btn-warning");

const chipButtons = document.querySelectorAll("#chips button");
const btnDel = document.getElementById("btnDel");

btnCard.disabled = true;
btnStand.disabled = true;


// Start des Spieles, return ein Array mit den Daten für die Karte
async function fetchStartCards() {
    const res = await fetch(`http://${window.location.hostname}:5105/api/blackjack/startCard`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${player}`
        }
    });
    return await res.json();
}

// Neue Karte ziehen
async function fetchDealCard() {
    const res = await fetch(`http://${window.location.hostname}:5105/api/blackjack/dealCard`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${player}`
        }
    });
    return await res.json();
}

// Nach Spielschluss sollen die Karten im Backend sowie Frontend entfernt werden
async function resetBackendDeck() {
    await fetch(`http://${window.location.hostname}:5105/api/blackjack/GameOver`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${player}`
        }
    });
}

// Abrufen des Standes des Users, damit Guthaben angezeigt wird
async function getCredits() {
    try {
        const response = await fetch(`http://${window.location.hostname}:5105/api/user/getData`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${player}`
            }
        });
        if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
        const userData = await response.json();
        return userData.credits ?? 0;
    } catch (error) {
        console.error("Fehler beim Laden des Bankwerts:", error);
        return 0;
    }
}

// Nach Spielende werden die Credits geposted
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

// Beim Laden des Spiels wird der Token initialisiert
async function initialize() {
    playerMoney = await getCredits();
    updateBetText();
    updatePlayerMoneyDisplay();
    clearCards();
}

// Anzeige Updaten
function updatePlayerMoneyDisplay() {
    const display = document.getElementById("playerMoneyDisplay");
    if (display) {
        display.textContent = `Guthaben: ${playerMoney}`;
    }
}

// Alert fürs Gewinnen, Verlieren, Unentschieden oder Credits aufladen
function showNotification(msg, btnTxt, redirectUrl) {
    let oldContainer = document.getElementById('notificationContainer');
    if (oldContainer) oldContainer.remove();
    let container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.zIndex = '9999';

    let box = document.createElement('div');
    box.style.backgroundColor = '#1f2937';
    box.style.color = '#fff';
    box.style.padding = '30px';
    box.style.borderRadius = '12px';
    box.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    box.style.textAlign = 'center';
    box.style.maxWidth = '300px';

    let text = document.createElement('p');
    text.innerText = msg;
    text.style.fontSize = '1.2rem';
    text.style.marginBottom = '20px';

    let button = document.createElement('button');
    button.innerText = btnTxt;
    button.style.backgroundColor = '#10b981';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.padding = '10px 20px';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
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

// Umwandlung der Bekommen Karten passend zu den Namen der vorhandenen Bilder
function renderCard(card, area, faceUp = true) {
    const img = document.createElement("img");
    img.src = faceUp ? card.image : "/Picture/Karten/Hinterseite.png";
    img.alt = `${card.rank} of ${card.suit}`;
    img.classList.add("card");

    if (area === dealerArea) {
        const placeholderContainer = dealerArea.querySelector("#dealerPlaceholders");
        const stapelContainer = dealerArea.querySelector("#stapelContainer");
        const slots = placeholderContainer?.querySelectorAll(".card-slot") ?? [];
        const currentCards = placeholderContainer?.querySelectorAll("img.card").length ?? 0;

        if (currentCards < 2 && slots[currentCards]) {
            // In einen freien Slot einfügen
            slots[currentCards].innerHTML = "";
            slots[currentCards].appendChild(img);
        } else {
            // Danach in Extra-Container einfügen
            let extra = document.getElementById("dealerExtraCards");
            if (!extra) {
                extra = document.createElement("div");
                extra.id = "dealerExtraCards";
                extra.className = "flex gap-2 ml-2";
                stapelContainer.insertAdjacentElement("beforebegin", extra);
            }
            extra.appendChild(img);
        }
    }
    else {
        // Spielerbereich
        const slots = area.querySelectorAll(".card-slot");
        const currentCards = area.querySelectorAll("img.card").length;

        if (currentCards < 2 && slots[currentCards]) {
            // In die ersten beiden Slots einfügen
            slots[currentCards].innerHTML = "";
            slots[currentCards].appendChild(img);
        } else {
            // Danach anhängen
            area.appendChild(img);
        }
    }
}

// Karten werden auf dem Tisch geleert
function clearCards() {
    dealerHand = [];
    playerHand = [];

    // Spieler Slots erzeugen
    playerSlot.innerHTML = "";
    for (let i = 0; i < 2; i++) {
        const slot = document.createElement("div");
        slot.className = "card-slot";
        playerSlot.appendChild(slot);
    }

    // Dealer Placeholder zurücksetzen
    const placeholderContainer = dealerArea.querySelector("#dealerPlaceholders");
    if (placeholderContainer) {
        placeholderContainer.innerHTML = "";
        for (let i = 0; i < 2; i++) {
            const slot = document.createElement("div");
            slot.className = "card-slot";
            placeholderContainer.appendChild(slot);
        }
    }

    // Eventuell vorhandene Extra-Karten entfernen
    const extraDealerCards = document.getElementById("dealerExtraCards");
    if (extraDealerCards) {
        extraDealerCards.remove();
    }
}

// Spiellogik: Zählen des Wertes der Karten
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

// Nach jedem Karten ziehen werden die Werte aktualisiert
function updateScores() {
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);
}

// Nach drücken des Einsatzes z. B. 1000 Chip dann füg er es in die Guthaben anzeige hinzu
function updateBetText() {
    einsatzWert.textContent = `${betAmount}`;
    updatePlayerMoneyDisplay();
}

// Spiellogik: Start des Spieles
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

    if (playerScore === 21) await stand();
}

// Spieler zieht eine Karte
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

// Spieler zieht keine Karte mehr, Vorgang des Dealers wird fortgesetzt
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

// Nachdem beide aufgehört haben karten zu ziehen, wird über diese Methode entschieden wer gewinnt
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
    chipButtons.forEach((chips) => { chips.disabled = false; });
    betContainer.style.pointerEvents = "auto";
    btnCard.disabled = true;
    btnStand.disabled = true;
    clearCards();
}

// Delay Methode
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Die Chips-Buttons
chipButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.textContent ? btn.textContent.replace(/\n/g, "").trim() : "";
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

// Delete-Button damit der Einsatz auf 0 gesetzt wird
btnDel.addEventListener("click", () => {
    betAmount = 0;
    updateBetText();
});
// BET-Anzeige im Spiel
betContainer.addEventListener("click", () => startGame());

// Hit-Button
btnCard.addEventListener("click", playerHit);

// Stand-Button
btnStand.addEventListener("click", stand);

initialize();
