public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public int Credits { get; set; }

    public User (int id, string username, int credits)
    {
        Id = id;
        Username = username;
        Credits = credits;
    }
}
