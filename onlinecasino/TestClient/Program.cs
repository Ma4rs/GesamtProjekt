class Program
{
    static void Main()
    {
        var db = new DatabaseService();
        var users = db.GetAllUsers();

        Console.WriteLine("📋 Nutzer in der Datenbank:");
        foreach (var user in users)
        {
            Console.WriteLine($"ID: {user.Id} | Username: {user.Username} | Credits: {user.Credits}");
        }
    }
}
