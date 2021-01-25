using System;

namespace ChatServer.Models
{
    public class UserModel
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Nickname { get; set; }
        public string ImgContent { get; set; }
        public string Email { get; set; }
        public DateTime LastOnline { get; set; }
        public bool IsOnline { get; set; }
        public int DeleteIfMissingFromMonths { get; set; }
    }
}
