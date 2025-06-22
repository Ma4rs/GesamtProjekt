async function main() {
  let cardcount = 0;
  let cardvalue1 = 0;
  let cardvalue2 = 0;
  const red = ["hearts", "diamonds"];
  let bankValue = await fetchBankValue();
  document.querySelector("#bankSpan").innerHTML = bankValue;

  // Einsatz beim Laden aus dem Backend holen
  const currentBet = await getBet();
  document.querySelector("#betSpan").textContent = currentBet;

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
  document.getElementById("bet").addEventListener("click", async function () {
    if (document.querySelector("#bankSpan").textContent !== "0") {

      if (!selectedChip) {
        alert("Bitte wähle zuerst einen Chip aus!");
        return;
      }
      // Hole aktuellen Einsatz als Zahl
      let currentBet = parseInt(document.querySelector("#betSpan").textContent, 10);
      if (isNaN(currentBet)) currentBet = 0;

      // Hole Bank
      let bank = parseInt(document.querySelector("#bankSpan")?.textContent || "1000", 10);

      let chipValue = selectedChip.dataset.value;
      let chipAmount = chipValue === "ALL" ? bank : parseInt(chipValue, 10);

      if (chipAmount > bank) {
        alert("Nicht genug Guthaben!");
        return;
      }

      currentBet += chipAmount;
      document.querySelector("#betSpan").textContent = currentBet;
      document.querySelector("#bankSpan").textContent = bank - chipAmount;

      if (document.querySelector("#bankSpan").textContent === "NaN") {
        document.querySelector("#bankSpan").textContent = 0;
      }
      console.log("Neuer Einsatz:", currentBet);

      // Einsatz an Backend melden
      try {
        await setBet(currentBet);
      } catch (e) {
        alert("Fehler beim Setzen des Einsatzes!");
      }
    }
  });

  // Spiel Auswahl Treffen
  document.getElementById("GameChoice").addEventListener("click", async function (event) {
    if (!event.target.classList.contains("card")) return; // Nur Karten-Auswahl
    const clickedId = event.target.id; // "auswahl1" oder "auswahl2"
    if (cardcount >= 3) return; // maximal 3 Karten
    let betValue = Number(document.querySelector("#betSpan")?.textContent);
    if (betValue === 0) {
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
          // richtig geraten
        } else {
          setTimeout(() => gameLost(), 500);
        }

        document.querySelector("#auswahl1").innerHTML = "Higher";
        document.querySelector("#auswahl2").innerHTML = "Lower";
      }
      else if (cardcount === 2) {
        if (userChoice === (cardvalue1 <= card.wert)) {
          // richtig geraten
        } else {
          setTimeout(() => gameLost(), 500);
        }

        cardvalue2 = card.wert;
        document.querySelector("#auswahl1").innerHTML = "Inside";
        document.querySelector("#auswahl2").innerHTML = "Outside";
      }
      else if (cardcount === 3) {
        let greater = Math.max(cardvalue1, cardvalue2);
        let lesser = Math.min(cardvalue1, cardvalue2);

        let isInside = card.wert > lesser && card.wert < greater;
        let isCorrect = (userChoice && isInside) || (!userChoice && !isInside);

        if (isCorrect) {
          setTimeout(() => gameWon(), 500);
        } else {
          setTimeout(() => gameLost(), 500);
        }
      }
    } catch (e) {
      console.error("Fehler :", e);
    }
  });

  let token = null;

  async function authorize() {
    const body = {
      "email": "string",
      "password": "string"
    }
    const Login = await axios.post(`http://localhost:5105/api/Casino/User/Login`, body);
    token = Login.data.token;
    return token;
  }

  console.log(token);

  async function fetchBankValue() {
    try {
      if (!token) await authorize();
      const userData = await axios.get('http://localhost:5105/api/Casino/User/GetData', {
        headers: {
          Authorization: `Bearer ${"Token: " +token}`
        }
      });
      return Number(userData.data.credits);
    } catch (error) {
      console.log("Fehler beim Laden des Bankwerts: ", error);
      return 0;
    }
  }

  async function UpdateBankValue(sum) {
    try {
      if (!token) await authorize();
      const body = {
        "creditsToAdd": sum
      };
      const response = await axios.post("http://127.0.0.1:5105/api/Casino/User/UpdateCredits", body, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        console.log('Erfolg');
      } else {
        console.log("Antwort ungültig:", response);
      }
    } catch (error) {
      console.log("Fehler beim Aktualisieren des Bankwerts: ", error);
    }
  }

  async function GetCard() {
    try {
      const response = await axios.get("http://localhost:5105/api/casino/tripleguess/newCard");
      return response.data;
    } catch (error) {
      console.log("Fehler beim Laden der Karte: ", error);
    }
  }

  async function setBet(betAmount) {
    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:5105/api/casino/tripleguess/setBet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ betAmount })
    });

    if (!response.ok) {
      throw new Error('Einsatz konnte nicht gesetzt werden');
    }
    return true;
  }

  async function getBet() {
    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:5105/api/casino/tripleguess/getBet', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Einsatz konnte nicht abgerufen werden');
    }

    const data = await response.json();
    return data.bet;
  }

  // Gewinn/Verlust-Logik
  async function gameLost() {
    let losMsg = 'Lost!';
    let losAct = 'Play Again';
    let losFrw = '../tripleGuess/index.html';
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
      window.location.href = losFrw;
    };
    let container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.append(container);
    notification.append(nBtn);
    container.prepend(notification);

    // Einsatz zurücksetzen und Bankwert anpassen
    let einsatz = Number(document.querySelector("#betSpan").textContent);
    await UpdateBankValue(-einsatz);
    let newBankValue = await fetchBankValue();
    document.querySelector("#bankSpan").textContent = newBankValue;
    document.querySelector("#betSpan").textContent = 0;
    setBet(0);
  }

  async function gameWon() {
    let winMsg = 'Gewonnen!';
    let winAct = 'Nochmal spielen';
    let winFrw = '../tripleGuess/index.html';
    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    let nSpan = document.createElement('span');
    nSpan.setAttribute('class', 'nSpan');
    nSpan.innerText = winMsg;
    notification.append(nSpan);

    let nBtn = document.createElement('div');
    nBtn.setAttribute('class', 'nBtn');
    nBtn.innerText = winAct;
    nBtn.onclick = function () {
      window.location.href = winFrw;
    };
    let container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.append(container);
    notification.append(nBtn);
    container.prepend(notification);

    // Einsatz zurücksetzen und Bankwert anpassen
    let einsatz = Number(document.querySelector("#betSpan").textContent);
    await UpdateBankValue(einsatz * 8);
    let newBankValue = await fetchBankValue();
    document.querySelector("#bankSpan").textContent = newBankValue;
    document.querySelector("#betSpan").textContent = 0;
    setBet(0);
  }
}

main();