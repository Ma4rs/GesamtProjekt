async function main() {
  let cardcount = 1;
  const username = "string";
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
  document.getElementById("GameChoice").addEventListener("click", async function () {
    if (document.querySelector("#betSpan")?.textContent !== "0") {
      try {
        const card = await GetCard();
        console.log(card.wert);
        console.log(card.art);
        cardid = `#card${cardcount}`;
        console.log(cardid)
        document.querySelector(cardid).innerHTML = `<img src="${card.bild}" alt="">`;
        cardcount++;
        
      } catch (e) {
        console.error("Fehler beim Ziehen einer Karte:", e);
      }
    } else {
      console.log("Kein Einsatz gesetzt!");
    }
  });


  // Für BankValue
  async function fetchBankValue() {
    try {
      const response = await axios.get(`http://localhost:5105/api/Casino/User/GetData/${username}`);
      return Number(response.data.credits);
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
      console.log("Fehler beim Laden des Spins: ", error);
    }
  }
}
main();