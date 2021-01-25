using System;

namespace ChatServer.Models
{
    public class UserInStorageModel
    {
        public int Id { get; set; }
        public UserModel User { get; set; }
        public StorageModel Storage { get; set; }
        public DateTime DateOfEntry { get; set; }
    }
}
