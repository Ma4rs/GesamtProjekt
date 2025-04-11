using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/Casino/Blackjack")]
    public class BlackjackController : ControllerBase
    {
        [HttpGet("DealCards")]
        public IActionResult DealCards()
        {
            // Beispiel: Karten austeilen
            var cards = new[] { "Ace of Spades", "10 of Hearts" };
            return Ok(cards);
        }
    }
}
