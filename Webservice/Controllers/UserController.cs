using C__Backend.Classes;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using onlinecasino.Database;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;

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


        // [HttpPost("Login")]
        // public async Task<IActionResult> Login([FromBody] LoginRequest request)
        // {
        //     using var context = new OnlineCasinoContext();

        //     var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        //     if (user == null)
        //     {
        //         return NotFound(new { message = "Benutzer nicht gefunden" });
        //     }

        //     if (user.PasswordHash != request.Password)
        //     {
        //         return Unauthorized(new { message = "Falsches Passwort" });
        //     }

        //     return Ok(new
        //     {
        //         message = "Login erfolgreich",
        //         username = user.Username,
        //         credits = user.Credits
        //     });
        // }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            using var context = new OnlineCasinoContext();

            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || user.PasswordHash != request.Password)
            {
                return Unauthorized(new { message = "E-Mail oder Passwort falsch" });
            }

            // JWT erzeugen
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
            var jwtExpire = int.Parse(_configuration["Jwt:ExpireMinutes"]);

            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, user.Username),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim("UserId", user.Id.ToString())
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(jwtExpire),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                message = "Login erfolgreich",
                token = tokenString
            });
        }

        private readonly IConfiguration _configuration;
        public UserController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [Authorize]
        [HttpGet("SecretArea")]
        public IActionResult Secret()
        {
            return Ok("Nur sichtbar mit gültigem Token!");
        }

    }
}
