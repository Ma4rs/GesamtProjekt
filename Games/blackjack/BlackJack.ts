let player = localStorage.getItem("userID");

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
  { rank: "ace", value: 11 },
];

let deck: Card[] = [];
let playerHand: Card[] = [];
let dealerHand: Card[] = [];

let playerScore = 0;
let dealerScore = 0;
let playerMoney = 1000; // Startwert – kann durch API ersetzt werden
let betAmount = 0;

const betContainer = document.getElementById("bet") as HTMLDivElement;
const betText = betContainer.querySelector(".einsatz-text") as HTMLElement;
const dealerArea = document.querySelector(
  ".absolute.top-16.w-full.flex.justify-center.z-10 > div.flex.items-start.gap-6.relative"
) as HTMLElement;
const playerSlot = document.getElementById("player") as HTMLElement;
const controls = document.querySelector(".absolute.bottom-4.w-full.flex.justify-center.gap-4.z-10") as HTMLElement;

const btnCard = controls.querySelector("button.btn-success") as HTMLButtonElement;
const btnStand = controls.querySelector("button.btn-warning") as HTMLButtonElement;

const chipButtons = document.querySelectorAll(".absolute.bottom-16.left-1\\/2.transform.-translate-x-1\\/2.flex.flex-col.items-center.gap-1.z-10 button");

btnCard.disabled = true;
btnStand.disabled = true;

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
  if (deck.length === 0) createDeck();

  const card = deck.pop()!;
  hand.push(card);

  const img = document.createElement("img");
  img.src = faceUp ? card.image : "/Picture/Karten/Hinterseite.png";
  img.alt = `${card.rank} of ${card.suit}`;
  img.classList.add("card");

  area.appendChild(img);
  updateScores();
}

function clearCards() {
  dealerHand = [];
  playerHand = [];
  dealerArea.querySelectorAll("img.card").forEach(card => card.remove());
  playerSlot.querySelectorAll("img.card").forEach(card => card.remove());
  updateScores();
}

function calculateScore(hand: Card[]): number {
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
  betText.textContent = `Bet: ${betAmount} € | Geld: ${playerMoney} €`;
}

function startGame() {
  if (betAmount <= 0) return alert("Bitte Einsatz wählen.");
  if (betAmount > playerMoney) return alert("Nicht genug Guthaben!");

  playerMoney -= betAmount;

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
  if (playerScore > 21) endGame("Bust! Du verlierst.");
}

function stand() {
  btnCard.disabled = true;
  btnStand.disabled = true;

  const dealerCards = dealerArea.querySelectorAll("img.card");
  if (dealerCards.length > 1) {
    (dealerCards[1] as HTMLImageElement).src = dealerHand[1].image;
  }

  while (dealerScore < 17) {
    dealCard(dealerHand, dealerArea, true);
  }

  if (dealerScore > 21) {
    endGame("Dealer bust! Du gewinnst.");
  } else if (dealerScore > playerScore) {
    endGame("Dealer gewinnt.");
  } else if (dealerScore < playerScore) {
    endGame("Du gewinnst!");
  } else {
    endGame("Unentschieden.");
  }
}

function endGame(msg: string) {
  alert(msg);
  if (msg.includes("gewinnst")) {
    playerMoney += betAmount * 2;
  } else if (msg.includes("Unentschieden")) {
    playerMoney += betAmount;
  }
  betAmount = 0;
  updateBetText();
  betContainer.style.pointerEvents = "auto";
}

chipButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent?.replace(/\n/g, "").trim();
    if (val === "ALLIN" || val === "ALL IN") {
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

betContainer.addEventListener("click", startGame);
btnCard.addEventListener("click", playerHit);
btnStand.addEventListener("click", stand);

updateBetText();
createDeck();
