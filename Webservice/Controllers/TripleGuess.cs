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
        private static readonly ConcurrentDictionary<string, List<string>> cardCaches = new();
        private static readonly object cacheLock = new object();

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

        [Authorize]
        [HttpGet("newCard")]
        public IActionResult newCard()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            var cache = cardCaches.GetOrAdd(userId, _ => new List<string>());

            lock (cacheLock)
            {
                if (cache.Count >= 52)
                    cache.Clear();

                int attempts = 0;
                while (attempts < 200)
                {
                    string suit = Suits[Random.Shared.Next(Suits.Length)];
                    var valueTuple = Values[Random.Shared.Next(Values.Length)];
                    string identifier = $"{valueTuple.Name}_of_{suit}";

                    if (!cache.Contains(identifier))
                    {
                        cache.Add(identifier);
                        string imageUrl = $"/Picture/Karten/{identifier}.png";
                        return Ok(new
                        {
                            Name = valueTuple.Name,
                            Wert = valueTuple.Value,
                            Art = suit,
                            Bild = imageUrl
                        });
                    }
                    attempts++;
                }
            }

            return StatusCode(500, new { message = "Keine neuen Karten verfügbar." });
        }

        [Authorize]
        [HttpPost("setBet")]
        public IActionResult SetBet([FromBody] SetBetRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            Bets[userId] = request.BetAmount;
            return Ok();
        }

        [Authorize]
        [HttpGet("getBet")]
        public IActionResult GetBet()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            Bets.TryGetValue(userId, out int betAmount);
            return Ok(new { bet = betAmount });
        }

        [Authorize]
        [HttpGet("GameOver")]
        public IActionResult GameOver()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            if (cardCaches.TryGetValue(userId, out var cache))
            {
                lock (cacheLock)
                {
                    cache.Clear();
                }
            }

            return Ok("Cache wieder leer");
        }
    }

    public class SetBetRequest
    {
        public int BetAmount { get; set; }
    }
}
