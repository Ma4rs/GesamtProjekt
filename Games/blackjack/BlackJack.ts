type Card = {
  suit: string;
  rank: string;
  value: number;
  image: string;
};

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
  { rank: "ace", value: 11 }, // Ass kann 1 oder 11 sein, hier vorerst 11
];

let deck: Card[] = [];
let playerHand: Card[] = [];
let dealerHand: Card[] = [];

let playerScore = 0;
let dealerScore = 0;

let betAmount = 0;
let playerMoney = 1000;

const betContainer = document.getElementById("bet") as HTMLDivElement;
const betText = betContainer.querySelector(".einsatz-text") as HTMLElement;
const dealerArea = document.querySelector(".absolute.top-16.w-full.flex.justify-center.z-10 > div.flex.items-start.gap-6.relative") as HTMLElement;
const playerSlot = document.querySelector(".absolute.bottom-28.w-full.flex.justify-center.gap-6.z-0") as HTMLElement;
const controls = document.querySelector(".absolute.bottom-4.w-full.flex.justify-center.gap-4.z-10") as HTMLElement;

const btnCard = controls.querySelector("button.btn-success") as HTMLButtonElement;
const btnStand = controls.querySelector("button.btn-warning") as HTMLButtonElement;

// Chips Buttons
const chipButtons = document.querySelectorAll(".absolute.bottom-16.left-1\\/2.transform.-translate-x-1\\/2.flex.flex-col.items-center.gap-1.z-10 button");

function createDeck() {
  deck = [];
  for (const suit of suits) {
    for (const r of ranks) {
      deck.push({
        suit,
        rank: r.rank,
        value: r.value,
        image: `/Picture/Karten/${r.rank}_of_${suit}.png`,
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

function dealCard(hand: Card[], area: HTMLElement, faceUp = true) {
  if (deck.length === 0) {
    alert("Das Deck ist leer, mische neu.");
    createDeck();
  }
  const card = deck.pop()!;
  hand.push(card);

  // Karte anzeigen
  const img = document.createElement("img");
  img.classList.add("card");
  img.style.position = "relative";
  img.style.zIndex = "10";
  img.src = faceUp ? card.image : "/Picture/Karten/Hinterseite.png";
  img.alt = `${card.rank} of ${card.suit}`;

  area.appendChild(img);

  updateScores();
}

function clearCards() {
  // Entferne nur die Karten aus der Hand (img.card), nicht den Stapel oder Platzhalter
  dealerHand = [];
  playerHand = [];

  const dealerCards = dealerArea.querySelectorAll("img.card");
  dealerCards.forEach(card => card.remove());

  const playerCards = playerSlot.querySelectorAll("img.card");
  playerCards.forEach(card => card.remove());

  updateScores();
}

function calculateScore(hand: Card[]): number {
  let score = 0;
  let aceCount = 0;

  for (const card of hand) {
    score += card.value;
    if (card.rank === "ace") aceCount++;
  }

  // Ass kann auch 1 sein, falls Score zu hoch ist
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

function updateScores() {
  playerScore = calculateScore(playerHand);
  dealerScore = calculateScore(dealerHand);
}

function updateBetText() {
  betText.textContent = `Bet: ${betAmount} €`;
}

function startGame() {
  if (betAmount <= 0) {
    alert("Bitte setze einen Einsatz, bevor du spielst!");
    return;
  }
  if (betAmount > playerMoney) {
    alert("Du hast nicht genug Geld für diesen Einsatz!");
    return;
  }

  playerMoney -= betAmount;

  clearCards();
  createDeck();

  // 2 Karten an Spieler (face up)
  dealCard(playerHand, playerSlot, true);
  dealCard(playerHand, playerSlot, true);

  // 2 Karten an Dealer: 1 face up, 1 verdeckt
  dealCard(dealerHand, dealerArea, true);
  dealCard(dealerHand, dealerArea, false);

  updateBetText();
  updateMoneyText();

  btnCard.disabled = false;
  btnStand.disabled = false;
  betContainer.style.pointerEvents = "none"; // Einsatz nicht mehr änderbar während Spiel

  // Prüfe Blackjack sofort
  if (playerScore === 21) {
    stand();
  }
}

function playerHit() {
  dealCard(playerHand, playerSlot, true);
  if (playerScore > 21) {
    endGame("Bust! Du hast verloren.");
  }
}

function stand() {
  btnCard.disabled = true;
  btnStand.disabled = true;

  // Verdeckte Karte vom Dealer aufdecken
  const dealerCards = dealerArea.querySelectorAll("img.card");
  if (dealerCards.length > 1) {
    (dealerCards[1] as HTMLImageElement).src = dealerHand[1].image;
  }

  // Dealer zieht Karten bis mind. 17 Punkte
  while (dealerScore < 17) {
    dealCard(dealerHand, dealerArea, true);
  }

  if (dealerScore > 21) {
    endGame("Dealer Bust! Du hast gewonnen.");
  } else if (dealerScore > playerScore) {
    endGame("Dealer gewinnt.");
  } else if (dealerScore < playerScore) {
    endGame("Du hast gewonnen!");
  } else {
    endGame("Unentschieden.");
  }
}

function endGame(message: string) {
  alert(message);
  if (message.includes("gewonnen")) {
    playerMoney += betAmount * 2;
  } else if (message.includes("Unentschieden")) {
    playerMoney += betAmount; // Einsatz zurück
  }
  betAmount = 0;
  updateBetText();
  updateMoneyText();

  betContainer.style.pointerEvents = "auto";
}

function updateMoneyText() {
  // Zeige das aktuelle Geld z.B. im Bet Container (kannst anpassen)
  betText.textContent = `Bet: ${betAmount} € | Geld: ${playerMoney} €`;
}

// Setze Einsatz über Chip-Buttons
chipButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const valText = btn.textContent?.trim();
    let val = 0;
    if (valText === "ALL\nIN" || valText === "ALL IN") {
      betAmount = playerMoney;
    } else {
      val = parseInt(valText || "0");
      if (!isNaN(val)) {
        betAmount += val;
        if (betAmount > playerMoney) betAmount = playerMoney;
      }
    }
    updateBetText();
  });
});

// Spiel starten beim Klick auf Einsatz-Bereich
betContainer.addEventListener("click", () => {
  startGame();
});

// Karten ziehen Button
btnCard.addEventListener("click", () => {
  playerHit();
});

// Passen Button
btnStand.addEventListener("click", () => {
  stand();
});

// Initial setup
updateBetText();
updateMoneyText();
createDeck();
