// async function main() {
//   let cardcount = 0;
//   const username = "string";
//   let bankValue = await fetchBankValue();
//   document.querySelector("#bankSpan").innerHTML = bankValue;

//   // Chip wählen
//   const chips = document.querySelectorAll(".chip-btn");
//   let selectedChip = null;
//   chips.forEach(chip => {
//     chip.addEventListener("click", () => {
//       if (selectedChip) {
//         selectedChip.classList.remove("active");
//       }
//       chip.classList.add("active");
//       selectedChip = chip;

//       const value = chip.dataset.value;
//       console.log("Ausgewählter Chip:", value);
//     });
//   });

//   // Chip platzieren
//   document.getElementById("bet").addEventListener("click", function () {
//     if (document.querySelector("#bankSpan").textContent !== "0") {

//       if (!selectedChip) {
//         alert("Bitte wähle zuerst einen Chip aus!");
//         return;
//       }
//       // Hole aktuellen Einsatz als Zahl
//       let currentBet = parseInt(document.querySelector("#betSpan").textContent, 10);
//       if (isNaN(currentBet)) currentBet = 0;

//       // Hole Bank (optional, falls du das brauchst)
//       let bank = parseInt(document.querySelector("#bankSpan")?.textContent || "1000", 10);

//       let chipValue = selectedChip.dataset.value;
//       if (chipValue === "ALL") {
//         currentBet += bank;
//       } else {
//         currentBet += parseInt(chipValue, 10);
//       }

//       document.querySelector("#betSpan").textContent = currentBet;
//       document.querySelector("#bankSpan").textContent -= chipValue;
//       if (document.querySelector("#bankSpan").textContent === "NaN") {
//         document.querySelector("#bankSpan").textContent = 0;
//       }
//       console.log("Neuer Einsatz:", currentBet);
//     }
//   });

//   // Spiel Auswahl Treffen
//   document.getElementById("GameChoice").addEventListener("click", async function () {
//     const red = ["hearts", "diamonds"];
//     // const black = ["spades", "clubs"];
//     // console.log(cardcount)
//     if (cardcount <= 3) {
//       console.log("cp1")
//       if (document.querySelector("#betSpan")?.textContent !== "0") {

//         try {
//           cardcount++;
//           const card = await GetCard();
//           console.log(card.wert);
//           console.log(card.art);
//           cardid = `#card${cardcount}`;
//           console.log(cardid)
//           document.querySelector(cardid).innerHTML = `<img src="${card.bild}" alt="">`;
//         } catch (e) {
//           console.error("Fehler beim Ziehen einer Karte:", e);
//         }
//         document.getElementById("GameChoice").addEventListener("click", function (event) {
//             const clickedId = event.target.id
//             console.log("Geklickte ID:", clickedId);            
//         });
//         switch (cardcount) {
//           case 1:
//             let isRed = (red.includes(card.art)) ? true : false;
//             if (isRed === ("auswahl1" === clickedId)) {
//               console.log("Red Wins")
//             }
//             else
//             {
//               console.log("Black Wins")
//             }
//             break;

//           case 2:

//             break;

//           case 3:

//             break;

//           default:
//             break;
//         }

//         if (cardcount === 3) {
//           console.log(cardcount)
//           clear();
//           cardcount = 0;
//         }
//       } else {
//         console.log("Kein Einsatz gesetzt!");
//       }
//     }


//   });


//   // Für BankValue
//   async function fetchBankValue() {

//     const body = {
//       "email": "string",
//       "password": "string"
//     }
//     const Login = await axios.post(`http://localhost:5105/api/Casino/User/Login`, body);
//     const token = Login.data.token;
//     try {
//       const userData = await axios.get('http://localhost:5105/api/Casino/User/GetData', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       return Number(userData.data.credits);
//     } catch (error) {
//       console.log("Fehler beim Laden des Bankwerts: ", error);
//       return 0;
//     }
//   }

//   // Für Karte die man zieht
//   async function GetCard() {
//     try {
//       const response = await axios.get("http://localhost:5105/api/casino/tripleguess/newCard");
//       return response.data;
//     } catch (error) {
//       console.log("Fehler beim Laden der Karte: ", error);
//     }
//   }
// }
// function clear() {
//   document.querySelector("#card1").innerHTML = `<img src="/Picture/Karten/Hinterseite.png" alt="">`;
//   document.querySelector("#card2").innerHTML = `<img src="/Picture/Karten/Hinterseite.png" alt="">`;
//   document.querySelector("#card3").innerHTML = `<img src="/Picture/Karten/Hinterseite.png" alt="">`;
// }
// main();
async function main() {
  let cardcount = 0;
  const red = ["hearts", "diamonds"];
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
  document.getElementById("GameChoice").addEventListener("click", async function (event) {
    if (!event.target.classList.contains("card")) return; // Nur Karten-Auswahl
    const clickedId = event.target.id; // "auswahl1" oder "auswahl2"
    if (cardcount >= 3) return; // maximal 3 Karten

    if (document.querySelector("#betSpan")?.textContent === "0") {
      console.log("Kein Einsatz gesetzt!");
      return;
    }

    cardcount++;
    try {
      const card = await GetCard();
      const cardid = `#card${cardcount}`;
      document.querySelector(cardid).innerHTML = `<img src="${card.bild}" alt="">`;

      // Auswertung
      if (cardcount === 1) {
        let isRed = red.includes(card.art);
        let userChoseRed = (clickedId === "auswahl1");
        if (isRed === userChoseRed) {
          console.log("Player Wins");
        } else {
          console.log("House Wins");
        }
      }
      else if (cardcount === 2) {
        card.value
      }

      // Bei 3 Karten alles zurücksetzen
      if (cardcount === 3) {
        setTimeout(() => {
          clear();
          cardcount = 0;
        }, 1000); // kurz anzeigen lassen
      }
    } catch (e) {
      console.error("Fehler beim Ziehen einer Karte:", e);
    }
  });

  // Für BankValue
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
}
function clear() {
  document.querySelector("#card1").innerHTML = `<img src="/Picture/Karten/Hinterseite.png" alt="">`;
  document.querySelector("#card2").innerHTML = `<img src="/Picture/Karten/Hinterseite.png" alt="">`;
  document.querySelector("#card3").innerHTML = `<img src="/Picture/Karten/Hinterseite.png" alt="">`;
}
main();