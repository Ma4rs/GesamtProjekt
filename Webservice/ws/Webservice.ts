import axios from "axios";

export default class Webservice {

    public static ws = axios.create({ baseURL: "https://deckofcardsapi.com" })


    // WS-Kommunikation


    public static getProfile() {

        this.ws.get("/profile"); // fdf
        // axios-Aufruf für Profildaten
        return { username: "mmeiser", coins: 50 };
    }


    public static karteZiehen(){
        const token = sessionStorage.getItem("token");
        this.ws.get("/blackjack/ziehen", token).then()//

        return {karte: "ASS HERZ"};
    }

}