using System;

namespace ApiService.Models
{
    public class StorageJoinLinkModel
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public StorageModel Storage { get; set; }
        public UserModel UserCreator { get; set; }
        public DateTime CreateDate { get; set; }
    }
}
