using System;

namespace ApiService.Models
{
    public class BanModel
    {
        public int Id { get; set; }
        public UserModel BannedUser { get; set; }
        public StorageModel Storage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; }
    }
}
