using C__Backend.Classes;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using onlinecasino.Database;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;


namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/Casino/User")]
    public class UserController : ControllerBase
    {

        [HttpGet("GetData/{username}")]
        public async Task<IActionResult> GetData(string username)
        {
            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden." });
                }

                return Ok(new
                {
                    Email = user.Email,
                    Credits = user.Credits
                });
            }
        }


        [HttpPost("RegisterUser")]
        public async Task<IActionResult> RegisterUser([FromBody] Userdata data)
        {
            using (var context = new OnlineCasinoContext())
            {
                var exists = await context.Users.AnyAsync(u => u.Email == data.Email);
                if (exists)
                    return Conflict(new { message = "User existiert bereits." });

                var newUser = new User
                {
                    Username = data.Username,
                    Email = data.Email,
                    PasswordHash = data.Password, // später: Hashed!
                    Credits = 100
                };

                context.Users.Add(newUser);
                await context.SaveChangesAsync();

                return Ok(new { message = "User erfolgreich registriert", credits = newUser.Credits });
            }
        }

        [HttpPost("UpdateCredits")]
        public async Task<IActionResult> UpdateCredits([FromBody] UpdateCreditsRequest request)
        {
            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden." });
                }

                user.Credits += request.CreditsToAdd;
                await context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Credits aktualisiert.",
                    newCredits = user.Credits
                });
            }
        }


        [HttpPost("LoginUser")]
        public async Task<IActionResult> LoginUser([FromBody] Userdata data)
        {
            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Email == data.Email);

                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden" });
                }

                // ❗ Passwortvergleich – aktuell unverschlüsselt (später: Hash-Vergleich)
                if (user.PasswordHash != data.Password)
                {
                    return Unauthorized(new { message = "Falsches Passwort" });
                }

                return Ok(new
                {
                    message = "Login erfolgreich",
                    username = user.Username,
                    credits = user.Credits
                });
            }
        }



    }
}
