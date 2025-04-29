import axios from "axios";

export default class Webservice {

    public static ws = axios.create({ baseURL: "http://localhost:xxxx/" })

    public static getCredits() {

        this.ws.get("coins/{userid}").then((response) => {

            return response.coins;

        });
    }

    // public static getUser() {

    //     this.ws.get
    // }

}