namespace C__Backend.Classes
{
    public class Userdata
    {

        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }

        public int? Credits { get; set; }
        //public string PasswordHash { get; set; }
        public Userdata(string username,string password, string email, int? credits)
        {
            Username = username;
            Password = password;
            Email = email;
            Credits = credits;
        }
    }
}
