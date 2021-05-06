using System;

namespace ApiService.Models
{
    public class StorageLogModel
    {
        public int Id { get; set; }
        public UserModel User { get; set; }
        public StorageModel Storage { get; set; }
        public DateTime CareateDate { get; set; }
        public string Content { get; set; }
    }
}
