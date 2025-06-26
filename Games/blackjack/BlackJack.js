let player = localStorage.getItem("token");

const suits = ["clubs", "diamonds", "hearts", "spades"];
const ranks = [
    { rank: "2", value: 2 },
    { rank: "3", value: 3 },
    { rank: "4", value: 4 },
    { rank: "5", value: 5 },
    { rank: "6", value: 6 },
    { rank: "7", value: 7 },
    { rank: "8", value: 8 },
    { rank: "9", value: 9 },
    { rank: "10", value: 10 },
    { rank: "jack", value: 10 },
    { rank: "queen", value: 10 },
    { rank: "king", value: 10 },
    { rank: "ace", value: 11 }
];

let playerMoney = 0;
let betAmount = 0;

let deck = [];
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

async function getCredits() {
    try {
        const response = await fetch("http://localhost:5105/api/user/getData", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${player}`
            }
        });
        const userData = await response.json();
        return userData.credits;
    } catch (error) {
        console.error("Fehler beim Laden des Bankwerts:", error);
        return 0;
    }
}

async function initialize() {
    playerMoney = await getCredits();
    updateBetText();
    createDeck();
    updatePlayerMoneyDisplay();
}

function updatePlayerMoneyDisplay() {
    const display = document.getElementById("playerMoneyDisplay");
    if (display) {
        display.textContent = `Guthaben: ${playerMoney}`;
    }
}

function createDeck() {
    deck = [];
    for (const suit of suits) {
        for (const r of ranks) {
            deck.push({
                suit: suit,
                rank: r.rank,
                value: r.value,
                image: `/Picture/Karten/${r.rank}_of_${suit}.png`
            });
        }
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCard(hand, area, faceUp = true) {
    if (deck.length === 0) createDeck();

    const card = deck.pop();
    hand.push(card);

    const img = document.createElement("img");
    img.src = faceUp ? card.image : "/Picture/Karten/Hinterseite.png";
    img.alt = `${card.rank} of ${card.suit}`;
    img.classList.add("card");

    if (area === dealerArea) {
        const placeholderContainer = dealerArea.querySelector("#dealerPlaceholders");
        const stapelContainer = dealerArea.querySelector("#stapelContainer");

        if (hand.length <= 2) {
            const slots = placeholderContainer.querySelectorAll(".card-slot");
            const cardIndex = hand.length - 1;
            if (slots[cardIndex]) {
                slots[cardIndex].innerHTML = "";
                slots[cardIndex].appendChild(img);
            }
        } else {

            if (stapelContainer) {
                stapelContainer.insertAdjacentElement("beforebegin", img);
            } else {
                area.appendChild(img);
            }
        }
    } else {
        const slots = area.querySelectorAll(".card-slot");
        const cardIndex = hand.length - 1;

        if (slots[cardIndex]) {
            slots[cardIndex].innerHTML = "";
            slots[cardIndex].appendChild(img);
        } else {
            area.appendChild(img);
        }
    }

    updateScores();
}



function clearCards() {
    dealerHand = [];
    playerHand = [];

    playerSlot.innerHTML = "";
    for (let i = 0; i < 2; i++) {
        const slot = document.createElement("div");
        slot.className = "card-slot";
        playerSlot.appendChild(slot);
    }

    while (dealerArea.firstChild) {
        dealerArea.removeChild(dealerArea.firstChild);
    }

    const placeholderContainer = document.createElement("div");
    placeholderContainer.id = "dealerPlaceholders";
    placeholderContainer.className = "flex gap-6";
    for (let i = 0; i < 2; i++) {
        const slot = document.createElement("div");
        slot.className = "card-slot";
        placeholderContainer.appendChild(slot);
    }

    const stapelDiv = document.createElement("div");
    stapelDiv.id = "stapelContainer";
    stapelDiv.className = "flex flex-col items-center";
    stapelDiv.innerHTML = `
      <img src="/Picture/Karten/Hinterseite.png" alt="#" class="card" />
      <div class="mt-1 text-center text-white text-xs opacity-70">Stapel</div>
    `;

    dealerArea.appendChild(placeholderContainer);
    dealerArea.appendChild(stapelDiv);

    updateScores();
}


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

function updateScores() {
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);
}

function updateBetText() {
    einsatzWert.textContent = `${betAmount}`;
    updatePlayerMoneyDisplay();
}

function startGame() {
    if (betAmount <= 0) {
        showNotification("Bitte Einsatz wählen.", "Okay", "");
        return;
    }

    playerMoney -= betAmount;
    chipButtons.forEach((chips) => {
        chips.disabled = true
    });
    clearCards();
    createDeck();

    dealCard(playerHand, playerSlot, true);
    dealCard(playerHand, playerSlot, true);

    dealCard(dealerHand, dealerArea, true);
    dealCard(dealerHand, dealerArea, false);

    updateBetText();

    btnCard.disabled = false;
    btnStand.disabled = false;
    betContainer.style.pointerEvents = "none";

    if (playerScore === 21) stand();
}

function playerHit() {
    dealCard(playerHand, playerSlot, true);
    sleep(5000)
    if (playerScore > 21) endGame("Du verlierst.");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function stand() {
    btnCard.disabled = true;
    btnStand.disabled = true;

    const dealerCards = dealerArea.querySelectorAll("img.card");

    if (dealerCards.length > 1) {
        dealerCards[1].src = dealerHand[1].image;
    }

    updateScores();

    while (dealerScore < 17) {
        await sleep(1000);
        dealCard(dealerHand, dealerArea, true);
        updateScores();
    }

    if (dealerScore > 21) {
        endGame("Dealer bust! Du gewinnst.");
    } else if (dealerScore > playerScore) {
        endGame("Du verlierst!");
    } else if (dealerScore < playerScore) {
        endGame("Du gewinnst!");
    } else {
        endGame("Unentschieden.");
    }
}
async function updateCredits(credits) {
    try {
        const response = await fetch("http://localhost:5105/api/user/updateCredits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${player}`
            },
            body: JSON.stringify({
                creditsToAdd: credits
            })
        });

    } catch (error) {
        console.error("Fehler beim POST an updateCredits:", error);
    }
}

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
        } else {
            window.location.href = redirectUrl;

        }
    };

    box.appendChild(text);
    box.appendChild(button);
    container.appendChild(box);
    document.body.appendChild(container);
}


async function endGame(msg) {
    let won = msg.includes("gewinnst");
    let draw = msg.includes("Unentschieden");
    if (won) {
        playerMoney += betAmount * 2;
        await updateCredits(betAmount);
        showNotification("Du hast gewonnen!", "Nochmal spielen", window.location.href);
    } else if (draw) {
        playerMoney += betAmount;
        await updateCredits(0);
        showNotification("Unentschieden!", "Nochmal spielen", window.location.href);
    } else {
        betAmount *= -1;
        await updateCredits(betAmount);

        if (playerMoney === 0) {
            showNotification("Keine Credits mehr!", "Credits aufladen", "../Interface/credits.html");
        } else {
            showNotification("Leider verloren!", "Nochmal spielen", window.location.href);
        }
    }

    betAmount = 0;
    updateBetText();
    betContainer.style.pointerEvents = "auto";
    chipButtons.forEach((chips) => {
        chips.disabled = false;
    });
    btnCard.disabled = true;
    btnStand.disabled = true;
    clearCards();
}

chipButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.textContent ? btn.textContent.replace(/\n/g, "").trim() : "";
        if (val === "ALL") {
            betAmount = playerMoney;
        } else {
            const amount = parseInt(val || "0");
            if (!isNaN(amount)) {
                betAmount = Math.min(playerMoney, betAmount + amount);
            }
        }
        updateBetText();
    });
});

btnDel.addEventListener("click", () => {
    betAmount = 0;
    updateBetText();
});

betContainer.addEventListener("click", startGame);

btnCard.addEventListener("click", playerHit);
btnStand.addEventListener("click", stand);

initialize();
