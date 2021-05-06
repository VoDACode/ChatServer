using System;

namespace ApiService.Models
{
    public class UserSessionsModel
    {
        public int Id { get; set; }
        public UserModel User { get; set; }
        public string Token { get; set; }
        public DateTime StartDate { get; set; }
    }
}
