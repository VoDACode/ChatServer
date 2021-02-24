using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

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
    }
}
