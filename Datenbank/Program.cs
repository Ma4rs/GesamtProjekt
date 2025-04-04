using System;

namespace onlinecasino.Datenbank
{
    class Program
    {
    static async Task Main()
    {
        var userService = new UserService();
        var databaseService = new DatabaseService();

        // 🔹 1. User vom Webserver abrufen
        var users = await userService.GetAllUsers();
        Console.WriteLine($"Empfangene User: {users.Count}");

        // 🔹 2. User in MSSQL speichern
        await databaseService.SaveUsers(users);

        Console.WriteLine("Fertig! ✨");
    }
    }
}
