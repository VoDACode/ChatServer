using System.ComponentModel.DataAnnotations.Schema;

namespace ApiService.Models
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
        [NotMapped]
        public bool IsDeleteStorage { get; set; } = false;
        //Logs
        public bool IsReadLog { get; set; }

        public void Set(PermissionTemplateModel model)
        {
            this.Name = model.Name;
            this.IsDeleteRoles = model.IsDeleteRoles;
            this.IsCreateRoles = model.IsCreateRoles;
            this.IsEditRoles = model.IsEditRoles;
            this.IsKickUser = model.IsKickUser;
            this.IsMuteUser = model.IsMuteUser;
            this.IsBanUser = model.IsBanUser;
            this.IsSendFiles = model.IsSendFiles;
            this.IsSendMessage = model.IsSendMessage;
            this.IsDeleteMessages = model.IsDeleteMessages;
            this.IsGenerateJoinURL = model.IsGenerateJoinURL;
            this.IsCopyJoinURL = model.IsCopyJoinURL;
            this.IsDeleteJoinURL = model.IsDeleteJoinURL;
            this.IsRenameStorage = model.IsRenameStorage;
            this.IsEditTitleImage = model.IsEditTitleImage;
            this.IsDeleteStorage = model.IsDeleteStorage;
            this.IsReadLog = model.IsReadLog;
        }
    }
}
