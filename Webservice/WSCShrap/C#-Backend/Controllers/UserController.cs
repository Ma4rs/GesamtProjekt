using C__Backend.Classes;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/Casino/User")]
    public class UserController : ControllerBase
    {
        [HttpPost("PostUserCredits")]
        public IActionResult PostUserCredits([FromBody] Userdata data)
        {
            Debug.WriteLine($"Empfangen: {data.Username} hat {data.Credits} Credits.");
            return Ok(new { message = "Daten empfangen", user = data.Username });
        }

        [HttpGet("GetData")]
        public string GetData()
        {

            return "noch keine werte Hier";
        }

        [HttpGet("GetCredits/{response}")]
        public string GetCredits(string response)
        {
            return response;
        }
    }
}
