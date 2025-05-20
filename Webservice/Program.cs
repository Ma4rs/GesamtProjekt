var builder = WebApplication.CreateBuilder(args);

// CORS hinzufügen
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        policy =>
        {
            policy.WithOrigins("http://127.0.0.1:5500") // deine Frontend-URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ❗️CORS aktivieren — unbedingt VOR Authorization!
app.UseCors("AllowLocalhost");

app.UseAuthorization();

app.MapControllers();

app.Run();
