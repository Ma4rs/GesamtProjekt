using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

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
        private static List<string> usedCards = new List<string>();

        private object CreateUniqueCard()
        {
            lock (locker)
            {
                if (usedCards.Count >= 52)
                {
                    // Alle Karten benutzt, Reset erzwingen
                    usedCards.Clear();
                }

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

        [HttpGet("startCard")]
        public IActionResult StartCard()
        {
            lock (locker)
            {
                usedCards.Clear(); // Reset deck beim Spielstart
            }

            var cards = new List<object>
            {
                CreateUniqueCard(), // Spielerkarte 1
                CreateUniqueCard(), // Spielerkarte 2
                CreateUniqueCard(), // Dealerkarte 1
                CreateUniqueCard()  // Dealerkarte 2 verdeckt
            };

            return Ok(cards);
        }

        [HttpGet("dealCard")]
        public IActionResult DealCard()
        {
            var card = CreateUniqueCard();
            return Ok(card);
        }

        [HttpGet("GameOver")]
        public IActionResult GameOver()
        {
            lock (locker)
            {
                usedCards.Clear();
            }
            return Ok(new { message = "Spiel beendet, Deck zurückgesetzt." });
        }
    }
}
