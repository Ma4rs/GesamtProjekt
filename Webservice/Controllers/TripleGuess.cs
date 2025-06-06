using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/casino/tripleguess/")]
    public class TripleGuessController : ControllerBase
    {
        private static readonly string[] Suits = { "hearts", "clubs", "spades", "diamonds" };
        private static readonly (string Name, int Value)[] Values = {
            ("ace", 14),
            ("2", 2),
            ("3", 3),
            ("4", 4),
            ("5", 5),
            ("6", 6),
            ("7", 7),
            ("8", 8),
            ("9", 9),
            ("10", 10),
            ("jack", 11),
            ("queen", 12),
            ("king", 13)
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
            string imageUrl = $"/Picture/Karten/{valueTuple.Name}_of_{suit}.png";

            var card = new
            {
                Name = valueTuple.Name,
                Wert = valueTuple.Value,
                Art = suit,
                Bild = imageUrl
            };

            return Ok(card);
        }
    }
}
