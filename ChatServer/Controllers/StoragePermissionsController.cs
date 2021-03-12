using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace ChatServer.Controllers
{
    [Authorize]
    [Route("api/storage/permission")]
    [ApiController]
    public class StoragePermissionsController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        public StoragePermissionsController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [HttpGet("me/list")]
        public IActionResult GetMyPermissions(string sID)
        {
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage.Id.ToString() == sID && us.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            var result = (from up in DB.UserPermissions
                          join p in DB.PermissionTemplates on up.PermissionTemplate.Id equals p.Id
                          where up.UserInStorage == userInStorage
                          select p).ToList();
            if(userInStorage.User == userInStorage.Storage.Creator)
            {
                result.Add(new PermissionTemplateModel()
                {
                    IsBanUser = true,
                    IsCopyJoinURL = true,
                    IsCreateRoles = true,
                    IsDeleteJoinURL = true,
                    IsDeleteMessages = true,
                    IsDeleteRoles = true,
                    IsEditRoles = true,
                    IsEditTitleImage = true,
                    IsGenerateJoinURL = true,
                    IsKickUser = true,
                    IsMuteUser = true,
                    IsReadLog = true,
                    IsRenameStorage = true,
                    IsSendFiles = true,
                    IsSendMessage = true,
                    Name = "Owner"
                });
            }
            return Ok(result);
        }

        [HttpGet("list")]
        public IActionResult GetPemissionListInStorage(string sID)
        {
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage.Id.ToString() == sID && us.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            var result = (from p in DB.PermissionTemplates
                          where p.Storage == userInStorage.Storage
                          select new
                          {
                              isSelected = p.Name == "Default",
                              isMainRole = p.Name == "Default",
                              template = p
                          }).ToList();

            return Ok(result);
        }

        [HttpPost("create")]
        public IActionResult CreatePemission(string sID, string JsonModel)
        {
            var permissionModel = JsonSerializer.Deserialize<PermissionTemplateModel>(JsonModel);
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage.Id.ToString() == sID && us.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            DB.PermissionTemplates.ToList();
            if(userInStorage.Storage.Creator != getUserFromDB && !DB.UserPermissions.Where(p => p.UserInStorage == userInStorage && p.PermissionTemplate.IsCreateRoles).Any())
                return BadRequest(new { errorText = "Access denied." });

            permissionModel.Storage = userInStorage.Storage;
            var result = DB.PermissionTemplates.Add(permissionModel);
            DB.SaveChanges();

            return Ok(result.Entity.Id);
        }

        [HttpPost("edit")]
        public IActionResult EditPermission(string sID, string JsonModel)
        {
            var permissionModel = JsonSerializer.Deserialize<PermissionTemplateModel>(JsonModel);
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage.Id.ToString() == sID && us.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            DB.PermissionTemplates.ToList();
            if (userInStorage.Storage.Creator != getUserFromDB && !DB.UserPermissions.Where(p =>
                    p.UserInStorage == userInStorage &&
                    p.PermissionTemplate.IsEditRoles).Any())
                return BadRequest(new { errorText = "Access denied." });

            var DB_permissionModel = DB.PermissionTemplates.FirstOrDefault(p => p.Storage == userInStorage.Storage && p.Id == permissionModel.Id);

            if (DB_permissionModel == null)
                return BadRequest(new { errorText = "This permission template is not found!" });
            int id = DB_permissionModel.Id;
            permissionModel.Id = DB_permissionModel.Id;
            DB_permissionModel = permissionModel;
            DB_permissionModel.Id = id;
            DB_permissionModel.Storage = userInStorage.Storage;
            DB.SaveChanges();

            return Ok(DB_permissionModel);
        }

        [HttpDelete("{sID}/{pID}/delete")]
        public IActionResult DeletePermission(string sID, string pID)
        {
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage.Id.ToString() == sID && us.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            DB.PermissionTemplates.ToList();
            if (userInStorage.Storage.Creator != getUserFromDB && !DB.UserPermissions.Where(p =>
                    p.UserInStorage == userInStorage &&
                    p.PermissionTemplate.IsDeleteRoles).Any())
                return BadRequest(new { errorText = "Access denied." });

            var permissionModel = DB.PermissionTemplates.FirstOrDefault(p => p.Storage == userInStorage.Storage && p.Id.ToString() == pID);

            if (permissionModel == null)
                return BadRequest(new { errorText = "Permission template is not found!" });

            if(permissionModel.Name == "Default")
                return BadRequest(new { errorText = "Access denied." });
            var removableUserPermissionTemplates = DB.UserPermissions.Where(p => p.PermissionTemplate == permissionModel);
            if (removableUserPermissionTemplates.Count() > 0)
            {
                DB.UserPermissions.RemoveRange(removableUserPermissionTemplates);
            }
            DB.PermissionTemplates.Remove(permissionModel);
            DB.SaveChanges();

            return Ok(permissionModel);
        }
    }
}
