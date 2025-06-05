<script>
  const chips = document.querySelectorAll('.selectable-chip');
  let selectedChip = null;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Vorherigen Chip deaktivieren
      if (selectedChip) {
        selectedChip.classList.remove('active');
      }

      // Aktuellen Chip aktivieren
      chip.classList.add('active');
      selectedChip = chip;

      const chipValue = chip.dataset.value;
      console.log("Ausgewählter Chip:", chipValue);
      // Hier kannst du das chipValue z.B. für Wette setzen
    });
  });
</script>
