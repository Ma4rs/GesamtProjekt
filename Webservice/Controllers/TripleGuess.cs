using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/tripleguess/")]
    public class TripleGuessController : ControllerBase
    {
        static List<object> cardCache = new List<object>();

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

        private static ConcurrentDictionary<string, int> Bets = new();
        private string? GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        [HttpGet("newCard")]
        public IActionResult newCard()
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
            if (cardCache.Contains(card))
            {
                newCard();
            }
            cardCache.Add(card);
            return Ok(card);
        }

        [Authorize]
        [HttpPost("setBet")]
        public IActionResult SetBet([FromBody] SetBetRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Kein Username im Token gefunden." });
            }

            Bets[userId] = request.BetAmount;
            return Ok();
        }

        [Authorize]
        [HttpGet("getBet")]
        public IActionResult GetBet()
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Kein Username im Token gefunden." });
            }

            Bets.TryGetValue(userId, out int betAmount);
            return Ok(new { bet = betAmount });
        }

        [HttpGet("GameOver")]
        public IActionResult GameOver()
        {
            cardCache.Clear();
            return Ok("Cache wieder leer");
        }
    }

    public class SetBetRequest
    {
        public int BetAmount { get; set; }
    }
}