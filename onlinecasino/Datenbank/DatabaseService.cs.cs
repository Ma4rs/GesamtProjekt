using System;

namespace onlinecasino.Datenbank
{
    public class DatabaseService.cs
    {
    private readonly OnlineCasinoContext _context;

    public DatabaseService()
    {
        _context = new OnlineCasinoContext();
    }

    // ✅ User in die Datenbank speichern (neu oder update)
    public async Task SaveUsers(List<User> users)
    {
        foreach (var user in users)
        {
            var existingUser = _context.Users.FirstOrDefault(u => u.Id == user.Id);
            if (existingUser == null)
            {
                // Neuer User → Einfügen
                _context.Users.Add(user);
            }
            else
            {
                // Existierender User → Update
                existingUser.Username = user.Username;
                existingUser.Credits = user.Credits;
            }
        }

        await _context.SaveChangesAsync();
        Console.WriteLine("Daten erfolgreich gespeichert!");
    }

    public List<User> GetAllUsers()
    {
        return _context.Users.ToList();
    }

    // ✅ Credits eines bestimmten Nutzers abrufen
    public int? GetUserCredits(int userId)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        return user?.Credits;
    }
}
}
