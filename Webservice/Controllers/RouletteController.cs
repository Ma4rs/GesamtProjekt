using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/roulette/")]
    public class RouletteController : ControllerBase 
    {   
        [HttpGet("spin")]
        public int spin() // Random Zahl zurückgeben für Spin
        {
            Random random = new Random();
            return random.Next(37);
        }
    }
}
