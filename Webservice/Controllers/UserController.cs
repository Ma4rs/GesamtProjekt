using C__Backend.Classes;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;


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
            return Ok(new { message = "Daten empfangen", user = data.Username , credits = data.Credits});
            
        }

[HttpPost("GetData")]
public async Task<IActionResult> GetData([FromBody] Userdata data)
{
    using (var context = new OnlineCasinoContext())
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == data.Email);

        if (user != null)
        {
            return Ok(new { credits = user.Credits, message = "User existiert bereits" });
        }
        else
        {
            var newUser = new User
            {
                Username = data.Username,
                Email = data.Email,
                PasswordHash = data.Password, // später Hash einbauen
                Credits = 100 // Startcredits
            };

            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            return Ok(new { credits = newUser.Credits, message = "Neuer User angelegt" });
        }
    }
}


        [HttpGet("GetCredits/{Username}")]
        public async Task<IActionResult> GetCredits(string username)
        {
            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username);
                if (user == null)
                {
                    return NotFound( new { message = "User nicht gefunden"});
                }

                return Ok(new { credits = user.Credits});
            }
        }

        [HttpPost("PostCredits/{Username}")]
        public async Task<IActionResult> PostCredits(string username)
        {
            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username);
                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden"});
                }

                return Ok(new { credits = user.Credits});
            }
        }
    }
}
