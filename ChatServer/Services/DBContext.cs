using ChatServer.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatServer.Services
{
    public class DBContext: DbContext
    {
        public DbSet<UserModel> Users { get; set; }
        public DbSet<UserSessionsModel> UserSessions { get; set; }
        public DbSet<ConfirmEmailModel> ConfirmEmails { get; set; }
        public DbSet<StorageModel> Storages { get; set; }
        public DbSet<ContactListModel> ContactLists { get; set; }
        public DbSet<UserInStorageModel> UserInStorages { get; set; }
        public DbSet<PermissionTemplateModel> PermissionTemplates { get; set; }
        public DbSet<UserPermissionsModel> UserPermissions { get; set; }
        public DbSet<MessageModel> Messages { get; set; }
        public DbSet<BanModel> Bans { get; set; }
        public DbSet<StorageLogModel> StorageLogs { get; set; }
        public DbSet<StorageJoinLinkModel> StorageJoinLinks { get; set; }
        public DBContext(DbContextOptions<DBContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
