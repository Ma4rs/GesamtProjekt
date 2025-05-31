using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/casino/tripleguess/")]
    public class TripleGuessController : ControllerBase
    {
        private static readonly string[] Suits = { "Herz", "Karo", "Pik", "Kreuz" };
        private static readonly (string Name, int Value)[] Values = {
            ("Ass", 1),
            ("2", 2),
            ("3", 3),
            ("4", 4),
            ("5", 5),
            ("6", 6),
            ("7", 7),
            ("8", 8),
            ("9", 9),
            ("10", 10),
            ("Bube", 11),
            ("Dame", 12),
            ("König", 13)
        };
        // https://deckofcardsapi.com/static/img/AH.png -> Bilder => alle Kopieren und lokal speichern wenn man das selber machen will
        // https://deckofcardsapi.com/api/deck/new/ -> create Deck => deck_id speichern
        // https://deckofcardsapi.com/api/deck/t41lp9yeb2oe/draw/?count=1 -> eine Karte ziehen
        // https://deckofcardsapi.com/api/deck/t41lp9yeb2oe/shuffle/ -> das Deck wieder shuffeln und anschließend kann man wieder spielen
        [HttpGet("newCard")]
        public IActionResult GetRandomCard()
        {
            var rng = new Random();
            string suit = Suits[rng.Next(Suits.Length)];
            var valueTuple = Values[rng.Next(Values.Length)];
            string imageUrl = $"https://example.com/cards/{suit.ToLower()}_{valueTuple.Name.ToLower()}.png";

            var card = new
            {
                Wert = valueTuple.Value,
                Art = suit,
                Bild = imageUrl
            };

            return Ok(card);
        }
    }
}
