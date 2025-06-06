using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/casino/tripleguess/")]
    public class TripleGuessController : ControllerBase
    {
        private static readonly string[] Suits = { "hearts", "clubs", "spades", "diamonds" };
        private static readonly string[] Values = {
            "ace",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "jack",
            "queen",
            "king"
                  };
        // https://deckofcardsapi.com/static/img/AH.png -> Bilder => alle Kopieren und lokal speichern wenn man das selber machen will
        // https://deckofcardsapi.com/api/deck/new/ -> create Deck => deck_id speichern
        // https://deckofcardsapi.com/api/deck/t41lp9yeb2oe/draw/?count=1 -> eine Karte ziehen
        // https://deckofcardsapi.com/api/deck/t41lp9yeb2oe/shuffle/ -> das Deck wieder shuffeln und anschließend kann man wieder spielen
        [HttpGet("newCard")]
        public IActionResult GetRandomCard()
        {
            var rnd = new Random();
            string suit = Suits[rnd.Next(Suits.Length)];
            var valueTuple = Values[rnd.Next(Values.Length)];
            string imageUrl = $"/Picture/Karten/{valueTuple}_of_{suit}.png";

            var card = new
            {
                Wert = valueTuple,
                Art = suit,
                Bild = imageUrl
            };

            return Ok(card);
        }
    }
}
