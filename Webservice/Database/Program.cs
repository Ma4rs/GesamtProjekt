using System;
using Microsoft.EntityFrameworkCore;
using C__Backend.Classes;
using C__Backend.Controllers;
using onlinecasino.Datenbank;

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

        Console.WriteLine("📋 Nutzer in der Datenbank:");
        foreach (var user in users)
        {
            Console.WriteLine($"ID: {user.Id} | Username: {user.Username} | Credits: {user.Credits}");
        }

        Console.WriteLine("Fertig! ✨");
    }
    }
}
