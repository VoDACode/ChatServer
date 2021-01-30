using System;

namespace ChatServer.Models
{
    public enum StorageType { Channel, Group, Private }
    public class StorageModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ImgContent { get; set; }
        public bool IsPrivate { get; set; }
        public string UniqueName { get; set; }
        public StorageType Type { get; set; }
        public DateTime CreateDate { get; set; }
        public UserModel Creator { get; set; }
    }
}
