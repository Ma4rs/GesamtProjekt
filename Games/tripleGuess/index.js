console.log("Script geladen!");
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