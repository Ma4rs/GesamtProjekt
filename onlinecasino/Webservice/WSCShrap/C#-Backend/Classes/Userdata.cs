namespace C__Backend.Classes
{
    public class Userdata
    {
        public int 	Id { get; set; }
        public string Username { get; set; }
        public int? Credits { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        //public string PasswordHash { get; set; }
        public Userdata(int id, string username, int? credits, string password, string email)
        {
            Id = id;
            Username = username;
            Credits = credits;
            Password = password;
            Email = email;
        }
    }
}
