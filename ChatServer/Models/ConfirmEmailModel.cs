using System;

namespace ChatServer.Models
{
    public class ConfirmEmailModel
    {
        public int Id { get; set; }
        public string LinkKey { get; set; }
        public string UserKey { get; set; }
        public UserModel User { get; set; }
        public DateTime CreateDate { get; set; }
    }
}
