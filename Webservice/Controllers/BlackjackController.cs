using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/blackjack")]
    public class BlackjackController : ControllerBase
    {
        private static readonly object locker = new object();

        private static readonly string[] suits = { "hearts", "clubs", "spades", "diamonds" };

        private static readonly (string Name, int Value)[] ranks = {
            ("ace", 11),
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

        private static readonly Random rnd = new Random();

        private static readonly ConcurrentDictionary<string, List<string>> userDecks = new();
        private static readonly ConcurrentDictionary<string, object> hiddenDealerCards = new();

        private string? GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private object CreateUniqueCard(List<string> usedCards)
        {
            lock (locker)
            {
                if (usedCards.Count >= 52)
                    usedCards.Clear();

                int attempts = 0;
                while (attempts < 100)
                {
                    string suit = suits[rnd.Next(suits.Length)];
                    var rank = ranks[rnd.Next(ranks.Length)];
                    string identifier = $"{rank.Name}_of_{suit}";

                    if (!usedCards.Contains(identifier))
                    {
                        usedCards.Add(identifier);
                        return new
                        {
                            rank = rank.Name,
                            value = rank.Value,
                            suit = suit,
                            image = $"/Picture/Karten/{identifier}.png"
                        };
                    }
                    attempts++;
                }

                throw new Exception("Keine neuen Karten verfügbar.");
            }
        }

        [Authorize]
        [HttpGet("startCard")]
        public IActionResult StartCard()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            var usedCards = userDecks.GetOrAdd(userId, _ => new List<string>());
            lock (locker)
            {
                usedCards.Clear();
            }

            var playerCard1 = CreateUniqueCard(usedCards);
            var playerCard2 = CreateUniqueCard(usedCards);
            var dealerCard1 = CreateUniqueCard(usedCards);
            var dealerCard2 = CreateUniqueCard(usedCards);

            hiddenDealerCards[userId] = dealerCard2;

            var cards = new List<object>
            {
                playerCard1,
                playerCard2,
                dealerCard1
            };

            return Ok(cards);
        }

        [Authorize]
        [HttpGet("dealCard")]
        public IActionResult DealCard()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            var usedCards = userDecks.GetOrAdd(userId, _ => new List<string>());
            var card = CreateUniqueCard(usedCards);
            return Ok(card);
        }

        [Authorize]
        [HttpGet("revealDealerCard")]
        public IActionResult RevealDealerCard()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            if (hiddenDealerCards.TryRemove(userId, out var card))
                return Ok(card);

            return NotFound(new { message = "Keine verdeckte Dealerkarte vorhanden." });
        }

        [Authorize]
        [HttpGet("GameOver")]
        public IActionResult GameOver()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Kein Username im Token gefunden." });

            if (userDecks.TryGetValue(userId, out var usedCards))
            {
                lock (locker)
                {
                    usedCards.Clear();
                }
            }
            hiddenDealerCards.TryRemove(userId, out _);

            return Ok(new { message = "Spiel beendet, Deck zurückgesetzt." });
        }
    }
}
