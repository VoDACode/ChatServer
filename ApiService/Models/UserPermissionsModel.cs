namespace ApiService.Models
{
    public class UserPermissionsModel
    {
        public int Id { get; set; }
        public UserInStorageModel UserInStorage { get; set; }
        public PermissionTemplateModel PermissionTemplate { get; set; }
    }
}
