using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/Casino/Roulette")]
    public class RouletteController : ControllerBase
    {
        [HttpGet("RandomNumber/{max}")]
        public int GetRandomNumber(int max)
        {
            Random random = new Random();
            return random.Next(max);
        }
    }
}
