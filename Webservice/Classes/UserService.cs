using System;
using System.Net.Http.Json;
using C__Backend.Classes;

namespace C__Backend.Classes
{
    public class UserService
    {
        private readonly HttpClient _httpClient = new();

    public async Task<List<User>> GetAllUsers()
    {
        var users = await _httpClient.GetFromJsonAsync<List<User>>("http://localhost:5244/api/Casino/User/GetAll");
        return users ?? new();
    }
    }
}
