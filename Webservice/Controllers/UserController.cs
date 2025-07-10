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
using BCrypt.Net;
using Microsoft.AspNetCore.Identity.Data;

namespace C__Backend.Controllers
{
    [ApiController]
    [Route("api/user")] // Basisroute für alle Endpunkte in diesem Controller
    public class UserController : ControllerBase
    {
        // Gibt Nutzerdaten zurück, sofern ein gültiger Token vorhanden ist
        [Authorize]
        [HttpGet("getData")]
        public async Task<IActionResult> GetData()
        {
            // Username aus dem JWT-Token extrahieren
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (username == null)
            {
                return Unauthorized(new { message = "Kein Username im Token gefunden." });
            }

            using (var context = new OnlineCasinoContext())
            {
                // Nutzer aus der Datenbank holen
                var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden." });
                }

                // E-Mail und Guthaben (Credits) zurückgeben
                return Ok(new
                {
                    Email = user.Email,
                    Credits = user.Credits
                });
            }
        }

        // Gibt den Benutzernamen zurück, basierend auf dem JWT-Token
        [Authorize]
        [HttpGet("getUsername")]
        public async Task<IActionResult> GetName()
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (username == null)
            {
                return Unauthorized(new { message = "Kein Username im Token gefunden." });
            }

            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(t => t.Username == username);

                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden. " });
                }

                return Ok(new
                {
                    Username = user.Username
                });
            }
        }

        // Registrierung eines neuen Benutzers
        [HttpPost("registerUser")]
        public async Task<IActionResult> RegisterUser([FromBody] Userdata data)
        {
            using (var context = new OnlineCasinoContext())
            {
                // Prüfen, ob Nutzer mit dieser E-Mail bereits existiert
                var exists = await context.Users.AnyAsync(u => u.Email == data.Email);
                if (exists)
                    return Conflict(new { message = "User existiert bereits." });

                // Passwort hashen
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(data.Password);

                // Neuen Nutzer anlegen
                var newUser = new User
                {
                    Username = data.Username,
                    Email = data.Email,
                    PasswordHash = hashedPassword,
                    Credits = 100 // Startguthaben
                };

                context.Users.Add(newUser);
                await context.SaveChangesAsync();

                return Ok(new { message = "User erfolgreich registriert", credits = newUser.Credits });
            }
        }

        // Credits des eingeloggten Benutzers aktualisieren
        [Authorize]
        [HttpPost("updateCredits")]
        public async Task<IActionResult> UpdateCredits([FromBody] UpdateCreditsRequest request)
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (username == null)
            {
                return Unauthorized(new { message = "Kein Username im Token gefunden." });
            }

            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden." });
                }

                // Credits hinzufügen
                user.Credits += request.CreditsToAdd;
                await context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Credits aktualisiert.",
                    newCredits = user.Credits
                });
            }
        }

        // Login eines bestehenden Benutzers
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginAnfrage request)
        {
            using var context = new OnlineCasinoContext();

            // Nutzer anhand der E-Mail suchen
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            // E-Mail oder Passwort falsch
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "E-Mail oder Passwort falsch" });
            }

            // JWT-Token generieren
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
            var jwtExpire = int.Parse(_configuration["Jwt:ExpireMinutes"]!);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username!),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim("UserId", user.Id.ToString()) // Benutzer-ID im Token speichern
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
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

        // Konstruktor mit Dependency Injection für Konfiguration
        private readonly IConfiguration _configuration;
        public UserController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Passwortänderung für eingeloggten Benutzer
        [Authorize]
        [HttpPost("changePwd")]
        public async Task<IActionResult> ChangePwd([FromBody] ChangePasswordRequest request)
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (username == null)
            {
                return Unauthorized(new { message = "Kein Username im Token gefunden." });
            }

            using (var context = new OnlineCasinoContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                {
                    return NotFound(new { message = "User nicht gefunden." });
                }

                // Altes Passwort prüfen
                if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
                {
                    return BadRequest(new { message = "Das alte Passwort ist nicht korrekt." });
                }

                // Neues Passwort hashen und speichern
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword); 
                await context.SaveChangesAsync();

                return Ok(new { message = "Passwort erfolgreich geändert." });
            }
        }

        // Methode zur Erzeugung eines zufälligen Passworts
        private string GenerateRandomPassword(int length)
        {
            const string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?";
            var random = new Random();
            return new string(Enumerable.Repeat(validChars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // Vergessenes Passwort: Neues zufälliges Passwort generieren
        [HttpPost("forgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordAnfrage request)
        {
            using var context = new OnlineCasinoContext();

            // Benutzer anhand der E-Mail finden
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return NotFound(new { message = "Benutzer mit dieser E-Mail wurde nicht gefunden." });
            }

            // Neues Passwort generieren und speichern
            var newPassword = GenerateRandomPassword(10);
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);

            user.PasswordHash = hashedPassword;
            await context.SaveChangesAsync();

            return Ok(new { message = "Ein neues Passwort wurde generiert.", request.Email, newPassword });
        }
    }
}
