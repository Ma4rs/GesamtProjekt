using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/casino/roulette/")]
    public class RouletteController : ControllerBase
    {
        private static readonly Random _random = new();

        [HttpGet("spin")]
        public int Spin() => _random.Next(16);
    }
}