using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/blackjack")]
    public class BlackjackController : ControllerBase
    {

        static List<Object> cacheCards = new List<object>();

        private static readonly string[] suits = { "hearts", "clubs", "spades", "diamonds" };
        private static readonly (string Name, int Value)[] ranks = {
            ("ace", 10),
            ("2", 2),
            ("3", 3),
            ("4", 4),
            ("5", 5),
            ("6", 6),
            ("7", 7),
            ("8", 8),
            ("9", 9),
            ("10", 10),
            ("jack", 10),
            ("queen", 10),
            ("king", 10)
        };

        [HttpGet("dealCard")]
        public IActionResult DealCard()
        {
            // Beispiel: Karten austeilen
            var rnd = new Random();
            string suit = suits[rnd.Next(suits.Length)];
            var valueTuple = ranks[rnd.Next(ranks.Length)];
            string imageUrl = $"/Picture/Karten/{valueTuple.Name}_of_{suit}.png";

            var card = new
            {
                Name = valueTuple.Name,
                Wert = valueTuple.Value,
                Art = suit,
                Bild = imageUrl
            };
            if (cacheCards.Contains(card))
            {
                DealCard();
            }
            cacheCards.Add(card);
            return Ok(card);
        }

        [HttpGet("startCard")]
        public IActionResult startCard()
        {
            var rnd = new Random();
            for (int i = 0; i < 2; i++)
            {
                string suit = suits[rnd.Next(suits.Length)];
                var valueTuple = ranks[rnd.Next(ranks.Length)];
                string imageUrl = $"/Picture/Karten/{valueTuple.Name}_of_{suit}.png";

                var card = new
                {
                    Name = valueTuple.Name,
                    Wert = valueTuple.Value,
                    Art = suit,
                    Bild = imageUrl
                };
                if (cacheCards.Contains(card))
                {
                    startCard();
                }
                cacheCards.Add(card);
            }
            return Ok(cacheCards);
        }

        [HttpGet("GameOver")]
        public IActionResult GameOver()
        {
            cacheCards.Clear();
            return Ok("Cache wieder leer");
        }
    }
}
