using Microsoft.AspNetCore.Mvc;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/roulette/")]
    public class RouletteController : ControllerBase
    {
        [HttpGet("spin")]
        public int spin()
        {
            return Random.Shared.Next(37);
        }
    }
}
