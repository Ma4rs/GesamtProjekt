import Webservice from "../../ws/Webservice";

export default class BlackJack {


    public karteZiehen(){
        Webservice.karteZiehen();

        (document.querySelector("#ausgabe") as HTMLInputElement).onclick = function(){
            
        };
    }

    public Spiel(){
        // const user = Webservice.getProfile();
        // user.coins


        return `<div>
        <h1>BlackJack</h1>



        
        </div>`
    }
}