import axios from "axios";
import Webservice from "./Webservice";

export default class Roulette extends Webservice {

    public static url = this.ws.baseURL + "/roulette/";

    public static getWinningField() {
        this.ws.get("WinningField").then((response) => {

            return Number(response)
        });
    }    
    
}