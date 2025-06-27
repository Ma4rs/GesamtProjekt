// tripleGuess.js
// Neu strukturiert für Übersichtlichkeit, Wiederverwendbarkeit und Fehlerrobustheit

// === Hilfsfunktionen für Token und API ===

// async function authorize() {
//   const body = {
//     email: "string", // TODO: Echte Werte verwenden!
//     password: "string"
//   };
//   const response = await axios.post("http://localhost:5105/api/user/login", body);
//   localStorage.setItem("token", response.data.token);
//   return response.data.token;
// }

// async function getToken() {
//   let token = localStorage.getItem("token");
//   // if (!token) {
//   //   token = await authorize();
//   // }
//   return token;
// }
document.querySelector("#betSpan").innerHTML = "0";
const token = localStorage.getItem("token");

async function fetchBankValue() {
  try {
    // const token = await getToken();
    // const token = localStorage.getItem("token");
    const res = await axios.get('http://localhost:5105/api/user/getData', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Number(res.data.credits);
  } catch (e) {
    showError("Fehler beim Laden des Bankwerts.");
    return 0;
  }
}

async function updateBankValue(sum) {
  try {
    // const token = await getToken();
    // const token = localStorage.getItem("token");
    const body = { creditsToAdd: sum };
    await axios.post("http://localhost:5105/api/user/updateCredits", body, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    showError("Fehler beim Aktualisieren des Guthabens.");
  }
}

async function getBet() {
  try {
    // const token = await getToken();
    // const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:5105/api/tripleguess/getBet', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    return data.bet;
  } catch (e) {
    showError("Fehler beim Abrufen des Einsatzes.");
    return 0;
  }
}

async function setBet(betAmount) {
  try {
    // const token = await getToken();
    // const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:5105/api/tripleguess/setBet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ betAmount })
    });
    if (!response.ok) throw new Error();
  } catch (e) {
    showError("Fehler beim Setzen des Einsatzes.");
  }
}

async function getCard() {
  try {
    const res = await axios.get("http://localhost:5105/api/tripleguess/newCard");
    return res.data;
  } catch (e) {
    showError("Fehler beim Laden der Karte.");
    throw e; // Spiel abbrechen
  }
}

// === UI Hilfsfunktionen ===

function showError(msg) {
  alert(msg);
}

function updateBankAndBet(bank, bet) {
  const bankSpan = document.querySelector("#bankSpan");
  const betSpan = document.querySelector("#betSpan");
  if (bankSpan) bankSpan.textContent = bank;
  if (betSpan) betSpan.textContent = bet;
}

function clearCardImages() {
  for (let i = 1; i <= 3; i++) {
    const card = document.querySelector(`#card${i}`);
    if (card) card.innerHTML = `<img src="/Picture/Karten/Hinterseite.png" alt="">`;
  }
}

function resetChoices() {
  const ausw1 = document.querySelector("#auswahl1");
  const ausw2 = document.querySelector("#auswahl2");
  if (ausw1) ausw1.textContent = "Red";
  if (ausw2) ausw2.textContent = "Black";
}

function resetChipSelection() {
  document.querySelectorAll(".chip-btn.active").forEach(btn => btn.classList.remove("active"));
}

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
  nBtn.onclick = function () {
    if (redirectUrl == "../Interface/credits.html") {
      window.top.location.href = redirectUrl;
    }
    window.location.href = redirectUrl;
  };
  let container = document.createElement('div');
  container.setAttribute('id', 'container');
  document.body.append(container);
  notification.append(nBtn);
  container.prepend(notification);
}

// === Hauptlogik ===

class TripleGuessGame {
  constructor() {
    this.cardCount = 0;
    this.cardValue1 = 0;
    this.cardValue2 = 0;
    this.redSuits = ["hearts", "diamonds"];
    this.selectedChip = null;
    this.gameActive = true;
  }

  async init() {
    await this.refreshUI();

    // Chip-Auswahl-Listener
    document.querySelectorAll(".chip-btn").forEach(chip => {
      chip.addEventListener("click", () => {
        this.selectChip(chip);
      });
    });

    // Bet-Button
    const betBtn = document.getElementById("bet");
    if (betBtn) {
      betBtn.addEventListener("click", () => this.placeBet());
    }

    // Spielauswahl
    const gameChoice = document.getElementById("GameChoice");
    if (gameChoice) {
      gameChoice.addEventListener("click", (event) => this.handleChoice(event));
    }
  }

  async refreshUI() {
    const bankValue = await fetchBankValue();
    await setBet(0);
    const currentBet = await getBet();
    updateBankAndBet(bankValue, currentBet);
    clearCardImages();
    resetChoices();
    resetChipSelection();
    this.cardCount = 0;
    this.cardValue1 = 0;
    this.cardValue2 = 0;
    this.gameActive = true;
  }

  selectChip(chip) {
    resetChipSelection();
    chip.classList.add("active");
    this.selectedChip = chip;
  }

  async placeBet() {
    if (!this.gameActive) return;
    const bankSpan = document.querySelector("#bankSpan");
    if (!bankSpan || bankSpan.textContent === "0") return;

    if (!this.selectedChip) {
      showError("Bitte wähle zuerst einen Chip aus!");
      return;
    }

    let currentBet = parseInt(document.querySelector("#betSpan")?.textContent, 10) || 0;
    let bank = parseInt(bankSpan.textContent || "1000", 10);
    let chipValue = this.selectedChip.dataset.value;
    let chipAmount = chipValue === "ALL" ? bank : parseInt(chipValue, 10);

    if (chipAmount > bank) {
      showError("Nicht genug Guthaben!");
      return;
    }

    currentBet += chipAmount;
    bank -= chipAmount;

    updateBankAndBet(bank, currentBet);

    if (isNaN(bank)) updateBankAndBet(0, currentBet);

    await setBet(currentBet);
  }

  async handleChoice(event) {
    if (!this.gameActive) return;
    if (!event.target.classList.contains("card")) return;
    if (this.cardCount >= 3) return;

    const clickedId = event.target.id;
    const betValue = Number(document.querySelector("#betSpan")?.textContent);
    if (betValue === 0) {
      showError("Kein Einsatz gesetzt!");
      return;
    }

    this.cardCount++;
    try {
      const card = await getCard();
      const cardid = `#card${this.cardCount}`;
      document.querySelector(cardid).innerHTML = `<img src="${card.bild}" alt="">`;

      let userChoice = (clickedId === "auswahl1");
      if (this.cardCount === 1) {
        disableBetAndChips();
        this.cardValue1 = card.wert;
        if (this.redSuits.includes(card.art) === userChoice) {
          // richtig geraten
        } else {
          setTimeout(() => {
            this.endGame(false);
          }, 750)
          return;
        }
        document.querySelector("#auswahl1").innerHTML = "Higher";
        document.querySelector("#auswahl2").innerHTML = "Lower";
      } else if (this.cardCount === 2) {
        if (userChoice === (this.cardValue1 < card.wert)) {
          // richtig geraten
        } else {
          setTimeout(() => {
            this.endGame(false);
          }, 550)
          return;
        }
        this.cardValue2 = card.wert;
        document.querySelector("#auswahl1").innerHTML = "Inside";
        document.querySelector("#auswahl2").innerHTML = "Outside";
      } else if (this.cardCount === 3) {
        let greater = Math.max(this.cardValue1, this.cardValue2);
        let lesser = Math.min(this.cardValue1, this.cardValue2);
        let isInside = card.wert > lesser && card.wert < greater;
        let isCorrect = (userChoice && isInside) || (!userChoice && !isInside);
        setTimeout(() => {
          this.endGame(isCorrect);
        }, 750)
      }
    } catch (e) {
      // Fehler schon angezeigt
    }
  }

  async endGame(won) {
    await axios.get("http://127.0.0.1:5105/api/tripleguess/GameOver");
    this.gameActive = false;
    let einsatz = Number(document.querySelector("#betSpan").textContent) || 0;
    if (won) {
      await updateBankValue(einsatz * 8);
      showNotification("Gewonnen!", "Nochmal spielen", "../tripleGuess/index.html");
    } else {
      await updateBankValue(-einsatz);
      let bankValue = await fetchBankValue();
      if (bankValue === 0) {
        showNotification("Keine Credits mehr", "Kaufe mehr Credits", "../Interface/credits.html");
      } else {
        showNotification("Lost!", "Play Again", "../tripleGuess/index.html");
      }
    }
    await setBet(0);
    updateBankAndBet(await fetchBankValue(), 0);
    resetChipSelection();
  }
}

function disableBetAndChips() {
  const betDiv = document.getElementById('bet');
  if (betDiv) {
    betDiv.style.pointerEvents = 'none';
    betDiv.style.opacity = '0.5';
  }
  document.querySelectorAll('.chip-btn').forEach(btn => btn.disabled = true);
  document.querySelectorAll('.chip-btn.active').forEach(btn => btn.classList.remove('active'));
  const clearBtn = document.getElementById('clear');
  if (clearBtn) clearBtn.style.display = 'none';
}

document.getElementById('clear').onclick = async function () {
  const game = new TripleGuessGame();
  game.init();
};
// === Initialisierung ===

window.addEventListener("DOMContentLoaded", () => {
  const game = new TripleGuessGame();
  game.init();
});