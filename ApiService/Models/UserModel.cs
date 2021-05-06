using System;
using System.Text.Json.Serialization;

namespace ApiService.Models
{
    public class UserModel
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        [JsonIgnore]
        public string Password { get; set; }
        public string Nickname { get; set; }
        public ImageStorageModel Image { get; set; }
        [JsonIgnore]
        public string Email { get; set; }
        public DateTime LastOnline { get; set; }
        public bool IsOnline { get; set; }
        public int DeleteIfMissingFromMonths { get; set; }
    }
}
