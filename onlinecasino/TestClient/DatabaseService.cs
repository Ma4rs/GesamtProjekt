using System.Collections.Generic;
using System.Linq;

public class DatabaseService
{
    private readonly OnlineCasinoContext _context;

    public DatabaseService()
    {
        _context = new OnlineCasinoContext();
    }

    public List<User> GetAllUsers()
    {
        return _context.Users.ToList();
    }
}
