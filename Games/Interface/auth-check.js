if (!localStorage.getItem('token')) { // prüft ob ein Token vorhanden ist  
  window.location.href = "anmelden.html";  // falls nicht wird man auf die anmelden Seite geleitet
                                           // Mögliche Erweiterung: prüfen ob es sich um einen gültigen Token handelt, falls nicht dann zurück auf anmelden.html
}