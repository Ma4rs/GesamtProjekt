using System;
using Microsoft.EntityFrameworkCore;
using C__Backend.Controllers; // oder je nach Namespace
using C__Backend.Classes;
using onlinecasino.Database;

namespace C__Backend.Classes
{
    public class DatabaseService
    {
            public async Task SaveUsers(List<User> users)
    {
        using var db = new OnlineCasinoContext();
        foreach (var user in users)
        {
            if (!await db.Users.AnyAsync(u => u.Username == user.Username))
            {
                db.Users.Add(user);
            }
        }
        await db.SaveChangesAsync();
    }
    }
}
