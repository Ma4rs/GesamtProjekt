using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/casino/roulette/")]
    public class RouletteController : ControllerBase
    {
        [HttpGet("RandomNumber")]
        public int GetRandomNumber()
        {
            Random random = new Random();
            return random.Next(16);
        }
    }
}
