namespace ApiService.Models
{
    public class ContactListModel
    {
        public int Id { get; set; }
        public UserModel FirstUser { get; set; }
        public UserModel SecondUser { get; set; }
        public StorageModel Storage { get; set; }
    }
}
