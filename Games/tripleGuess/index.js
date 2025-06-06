async function main() {
  let cardcount = 0;
  let cardvalue1 = 0
  let cardvalue2 = 0;
  const red = ["hearts", "diamonds"];
  let bankValue = await fetchBankValue();
  document.querySelector("#bankSpan").innerHTML = bankValue;

  // Chip wählen
  const chips = document.querySelectorAll(".chip-btn");
  let selectedChip = null;
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      if (selectedChip) {
        selectedChip.classList.remove("active");
      }
      chip.classList.add("active");
      selectedChip = chip;

      const value = chip.dataset.value;
      console.log("Ausgewählter Chip:", value);
    });
  });

  // Chip platzieren
  document.getElementById("bet").addEventListener("click", function () {
    if (document.querySelector("#bankSpan").textContent !== "0") {

      if (!selectedChip) {
        alert("Bitte wähle zuerst einen Chip aus!");
        return;
      }
      // Hole aktuellen Einsatz als Zahl
      let currentBet = parseInt(document.querySelector("#betSpan").textContent, 10);
      if (isNaN(currentBet)) currentBet = 0;

      // Hole Bank (optional, falls du das brauchst)
      let bank = parseInt(document.querySelector("#bankSpan")?.textContent || "1000", 10);

      let chipValue = selectedChip.dataset.value;
      if (chipValue === "ALL") {
        currentBet += bank;
      } else {
        currentBet += parseInt(chipValue, 10);
      }

      document.querySelector("#betSpan").textContent = currentBet;
      document.querySelector("#bankSpan").textContent -= chipValue;
      if (document.querySelector("#bankSpan").textContent === "NaN") {
        document.querySelector("#bankSpan").textContent = 0;
      }
      console.log("Neuer Einsatz:", currentBet);
    }
  });

  // Spiel Auswahl Treffen
  document.getElementById("GameChoice").addEventListener("click", async function (event) {
    if (!event.target.classList.contains("card")) return; // Nur Karten-Auswahl
    const clickedId = event.target.id; // "auswahl1" oder "auswahl2"
    if (cardcount >= 3) return; // maximal 3 Karten
    let bankValue = Number(document.querySelector("#betSpan")?.textContent);
    if (bankValue === 0) {
      console.log("Kein Einsatz gesetzt!");
      return;
    }

    cardcount++;
    try {
      const card = await GetCard();
      const cardid = `#card${cardcount}`;
      document.querySelector(cardid).innerHTML = `<img src="${card.bild}" alt="">`;

      let userChoice = (clickedId === "auswahl1");
      if (cardcount === 1) {
        cardvalue1 = card.wert;
        if (red.includes(card.art) === userChoice) {

        } else {
          setTimeout(gameOver, 500);
        }

        document.querySelector("#auswahl1").innerHTML = "Higher";
        document.querySelector("#auswahl2").innerHTML = "Lower";
      }
      else if (cardcount === 2) {
        if (userChoice === (cardvalue1 <= card.wert)) {

        } else {
          setTimeout(gameOver, 500);
        }

        cardvalue2 = card.wert;
        document.querySelector("#auswahl1").innerHTML = "Inside";
        document.querySelector("#auswahl2").innerHTML = "Outside";
      }
      else if (cardcount === 3) {
        let greater = cardvalue1;
        let lesser = cardvalue2;
        if (userChoice === (card.wert)) {

        } else {
          setTimeout(gameOver, 500);
        }

      }

      // if (cardcount === 3) {
      // setTimeout(() => {
      //   clear();
      //   cardcount = 0;
      // }, 1000);
      // }
    } catch (e) {
      console.error("Fehler :", e);
    }
  });

  // Für BankValue
}
async function fetchBankValue() {
  const body = {
    "email": "string",
    "password": "string"
  }
  const Login = await axios.post(`http://localhost:5105/api/Casino/User/Login`, body);
  const token = Login.data.token;
  try {
    const userData = await axios.get('http://localhost:5105/api/Casino/User/GetData', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return Number(userData.data.credits);
  } catch (error) {
    console.log("Fehler beim Laden des Bankwerts: ", error);
    return 0;
  }
}

// Für Karte die man zieht
async function GetCard() {
  try {
    const response = await axios.get("http://localhost:5105/api/casino/tripleguess/newCard");
    return response.data;
  } catch (error) {
    console.log("Fehler beim Laden der Karte: ", error);
  }
}

function gameOver() {
  let losMsg = 'Lost!';
  let losAct = 'Play Again';
  let losFrw = '../Interface/tripleGuess.html';
  if (Number(document.querySelector("#bankSpan").textContent) === 0) {
    losMsg = 'Keine Credits mehr';
    losAct = 'Kaufe mehr Credits';
    losFrw = '../Interface/credits.html';
  }
  let notification = document.createElement('div');
  notification.setAttribute('id', 'notification');
  let nSpan = document.createElement('span');
  nSpan.setAttribute('class', 'nSpan');
  nSpan.innerText = losMsg;
  notification.append(nSpan);

  let nBtn = document.createElement('div');
  nBtn.setAttribute('class', 'nBtn');
  nBtn.innerText = losAct;
  nBtn.onclick = function () {
    window.top.location.href = losFrw;  // .top nötig damit es nicht im Frame geöffnet wird
  };
  let container = document.createElement('div');
  container.setAttribute('id', 'container');
  document.body.append(container);
  notification.append(nBtn);
  container.prepend(notification);
}
main();