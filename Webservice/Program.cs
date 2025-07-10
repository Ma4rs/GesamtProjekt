using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// Erstellt den WebApplication-Builder für den App-Start
var builder = WebApplication.CreateBuilder(args);

// 🔐 JWT-Konfiguration aus der appsettings.json laden (Abschnitt "Jwt")
var jwtConfig = builder.Configuration.GetSection("Jwt");

// ➕ CORS (Cross-Origin Resource Sharing) Konfiguration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", // Eine Policy namens "AllowAll"
        policy =>
        {
            policy.AllowAnyOrigin()   // Erlaubt Zugriffe von allen Domains
                  .AllowAnyHeader()   // Erlaubt alle Header
                  .AllowAnyMethod();  // Erlaubt alle HTTP-Methoden (GET, POST, etc.)
        });
});

// ➕ Authentifizierungsdienst mit JWT-Bearer Token einrichten
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Überprüft den "Issuer" (Herausgeber des Tokens)
            ValidateAudience = true, // Überprüft den "Audience" (Zielgruppe des Tokens)
            ValidateLifetime = true, // Überprüft, ob das Token abgelaufen ist
            ValidateIssuerSigningKey = true, // Überprüft, ob der Signierungsschlüssel gültig ist

            // Gültiger Herausgeber & Zielgruppe aus der Konfiguration
            ValidIssuer = jwtConfig["Issuer"],
            ValidAudience = jwtConfig["Audience"],

            // Der Schlüssel, mit dem das Token signiert wurde
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtConfig["Key"]!)
            )
        };
    });

// ➕ Füge Controller-Unterstützung hinzu (API-Endpunkte)
builder.Services.AddControllers();

// ➕ OpenAPI/Swagger Setup (für Dokumentation & Testing)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OnlineCasino API", // Titel der API im Swagger UI
        Version = "v1"              // API-Version
    });

    // 🛡️ JWT-Authentifizierung zu Swagger hinzufügen
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization", // Name des Headers
        Type = SecuritySchemeType.ApiKey, // Typ: API Key (da Header)
        Scheme = "Bearer", // Schema: Bearer
        BearerFormat = "JWT", // Format: JWT
        In = ParameterLocation.Header, // Wo der Token eingefügt wird
        Description = "Gib dein JWT Token hier ein: 'Bearer {token}'"
    });

    // Anforderung, dass bei geschützten Endpunkten der "Bearer" angegeben werden muss
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer" // Verweis auf das oben definierte "Bearer"-Schema
                }
            },
            Array.Empty<string>()
        }
    });
});

// 🏗️ Anwendung bauen (Middleware-Pipeline ab hier)
var app = builder.Build();

// 🌐 Swagger nur im Entwicklungsmodus aktivieren
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();      // Generiert Swagger JSON
    app.UseSwaggerUI();    // UI zur Visualisierung der API
}

// ⚙️ HTTP-Middleware-Pipeline konfigurieren (Reihenfolge ist wichtig!)
app.UseCors("AllowAll");         // Zuerst CORS aktivieren
app.UseAuthentication();         // Authentifizierungsmiddleware hinzufügen
app.UseAuthorization();          // Autorisierungsmiddleware hinzufügen

app.MapControllers();            // Controller-Routing aktivieren (API-Endpunkte verfügbar machen)

app.Run();                       // Anwendung starten
