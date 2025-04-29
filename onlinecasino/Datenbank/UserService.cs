using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace onlinecasino.Datenbank
{
    public class UserService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://dein-webserver.com/api/users"; // ❗ Webserver-URL anpassen

        public UserService()
        {
            _httpClient = new HttpClient();
        }

        public async Task<List<User>> GetAllUsers()
        {
            var response = await _httpClient.GetAsync(_baseUrl);
            if (!response.IsSuccessStatusCode) return new List<User>();

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<User>>(json) ?? new List<User>();
        }
    }
}
