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