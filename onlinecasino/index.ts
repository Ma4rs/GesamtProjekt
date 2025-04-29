// SCSS (CSS) Datei einbinden, damit diese mit ausgeliefert wird
import axios from 'axios';
import '../scss/style.scss';
import Card from './classes/Card';
import BlackJack from './game/blackjack/BlackJack';

const ws = axios.create({ baseURL: "https://deckofcardsapi.com" })

let id = 1
for (let index = 0; index < 4; index++) {
    (document.querySelector("#ausgabe") as HTMLDivElement).innerHTML += `<button id="card${id}"> <img src="https://deckofcardsapi.com/static/img/back.png"></button>`;
    id++;
}

(document.querySelector("#ausgabe") as HTMLInputElement).onclick = function(){
    console.log((document.querySelector("#ausgabe") as HTMLDataElement).value);
};
ws.get("https://deckofcardsapi.com/static/img/back.png").then((response) => {

    // const cards: Card[] = response.data.card.image;
    // for (const card of cards) {
    // (document.querySelector("#ausgabe") as HTMLDivElement).innerHTML += `<button id="card${id}"> <img src="${card.image}"> </button>`; ///api/deck/new/draw/?count=4    
    // }
});


(document.querySelector("#karteziehen") as HTMLInputElement).onclick = function(){

    BlackJack spiel = new BlackJack();
    const karte = spiel.karteZiehen();
    (document.querySelector("#karte") as HTMLDivElement).innerHTML = karte.image;

    
};