import axios from "axios";
import Webservice from "./Webservice";

export default class BlackJack extends Webservice {


    public static url = this.ws.baseURL + "/blackjack/";

    public static karteZiehen() {
        const token = sessionStorage.getItem("token");
        this.ws.get("https://deckofcardsapi.com/api/deck/a6sdup9bhg2b/draw/?count=1", token).then()//

        return { karte: "ASS HERZ" };
    }

}