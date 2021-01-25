namespace ChatServer.Models
{
    public class PermissionTemplateModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public StorageModel Storage { get; set; }
        //Roles
        public bool IsDeleteRoles { get; set; }
        public bool IsCreateRoles { get; set; }
        public bool IsEditRoles { get; set; }
        //Users
        public bool IsKickUser { get; set; }
        public bool IsBanUser { get; set; }
        public bool IsMuteUser { get; set; }
        //Messages
        public bool IsSendMessage { get; set; }
        public bool IsDeleteMessages { get; set; }
        public bool IsSendFiles { get; set; }
        //Join lincks
        public bool IsGenerateJoinURL { get; set; }
        public bool IsCopyJoinURL { get; set; }
        public bool IsDeleteJoinURL { get; set; }
        //Storage
        public bool IsRenameStorage { get; set; }
        public bool IsEditTitleImage { get; set; }
        //Logs
        public bool IsReadLog { get; set; }
    }
}
