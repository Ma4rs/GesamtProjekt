using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/blackjack")]
    public class BlackjackController : ControllerBase
    {
        // Lock-Objekt für Thread-Sicherheit
        private static readonly object locker = new object();

        // Mögliche Kartenfarben
        private static readonly string[] suits = { "hearts", "clubs", "spades", "diamonds" };

        // Kartenwerte und -namen (Ass = 11, Bilderkarten = 10)
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

        // Zufallsinstanz zum Ziehen von Karten
        private static readonly Random rnd = new Random();

        // Merkt sich, welche Karten schon benutzt wurden
        private static List<string> usedCards = new List<string>();

        // Eine neue, zufällige Karte generieren, die noch nicht verwendet wurde
        private object CreateUniqueCard()
        {
            lock (locker)
            {
                // Falls alle 52 Karten verwendet wurden: Deck zurücksetzen
                if (usedCards.Count >= 52)
                {
                    usedCards.Clear();
                }

                int attempts = 0;

                // Max. 100 Versuche, eine unbenutzte Karte zu finden
                while (attempts < 100)
                {
                    string suit = suits[rnd.Next(suits.Length)];
                    var rank = ranks[rnd.Next(ranks.Length)];
                    string identifier = $"{rank.Name}_of_{suit}";

                    // Wenn Karte noch nicht verwendet wurde → zurückgeben
                    if (!usedCards.Contains(identifier))
                    {
                        usedCards.Add(identifier);
                        return new
                        {
                            rank = rank.Name,
                            value = rank.Value,
                            suit = suit,
                            image = $"/Picture/Karten/{identifier}.png" // Bildpfad der Karte
                        };
                    }
                    attempts++;
                }

                // Falls keine Karte gefunden wurde (z. B. bei Fehler im Deck), Exception werfen
                throw new Exception("Keine neuen Karten verfügbar.");
            }
        }

        // Route: /api/blackjack/startCard
        // Zu Spielbeginn: Deck zurücksetzen und 4 Karten geben (2 Spieler, 2 Dealer)
        [HttpGet("startCard")]
        public IActionResult StartCard()
        {
            lock (locker)
            {
                usedCards.Clear(); // Spielstart = neues Deck
            }

            var cards = new List<object>
            {
                CreateUniqueCard(), // Spielerkarte 1
                CreateUniqueCard(), // Spielerkarte 2
                CreateUniqueCard(), // Dealerkarte 1 (sichtbar)
                CreateUniqueCard()  // Dealerkarte 2 (verdeckt, aber gleich mitgegeben)
            };

            return Ok(cards);
        }

        // Route: /api/blackjack/dealCard
        // Spieler oder Dealer zieht eine Karte während des Spiels
        [HttpGet("dealCard")]
        public IActionResult DealCard()
        {
            var card = CreateUniqueCard();
            return Ok(card);
        }

        // Route: /api/blackjack/GameOver
        // Nach Spielende wird das Deck zurückgesetzt (für nächsten Durchlauf)
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
