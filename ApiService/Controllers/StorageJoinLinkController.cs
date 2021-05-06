using ApiService.Models;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiService.Controllers
{
    [Authorize]
    [Route("storage/join")]
    [ApiController]
    public class StorageJoinLinkController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        public StorageJoinLinkController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [HttpGet("list")]
        public IActionResult GetJoinLinks(string sId)
        {
            if (string.IsNullOrWhiteSpace(sId))
                return BadRequest(new { errorText = "Parameter expected 'sId'." });
            DB.Images.ToList();
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage.Id.ToString() == sId && p.User == getUserFromDB);
            if(userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            DB.PermissionTemplates.ToList();
            if(userInStorage.Storage.Creator != getUserFromDB &&
                !DB.UserPermissions.Where(p =>
                    p.UserInStorage == userInStorage &&
                    p.PermissionTemplate.IsCopyJoinURL
                ).Any())
            {
                return BadRequest(new { errorText = "Access denied." });
            }

            var result = DB.StorageJoinLinks.Where(p => p.Storage == userInStorage.Storage).Select(r => new
            {
                r.Id,
                r.Key,
                r.CreateDate,
                userCreator = new
                {
                    id = r.UserCreator.Id,
                    imgContent = r.UserCreator.Image == null ? null : r.UserCreator.Image.Key,
                    userName = r.UserCreator.UserName,
                    nickname = r.UserCreator.Nickname,
                }
            }).ToList();

            return Ok(result);
        }

        [HttpPost("create")]
        public IActionResult CreateJoinLink(string sId)
        {
            if (string.IsNullOrWhiteSpace(sId))
                return BadRequest(new { errorText = "Parameter expected 'sId'." });
            DB.Images.ToList();
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage.Id.ToString() == sId && p.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            DB.PermissionTemplates.ToList();
            if (userInStorage.Storage.Creator != getUserFromDB &&
                !DB.UserPermissions.Where(p =>
                    p.UserInStorage == userInStorage &&
                    p.PermissionTemplate.IsGenerateJoinURL
                ).Any())
            {
                return BadRequest(new { errorText = "Access denied." });
            }

            var joinModel = new StorageJoinLinkModel()
            {
                CreateDate = DateTime.Now,
                Key = "".RandomString(32),
                Storage = userInStorage.Storage,
                UserCreator = getUserFromDB
            };
            var dbJoinModel = DB.StorageJoinLinks.Add(joinModel);
            DB.SaveChanges();

            return Ok(new
            {
                id = dbJoinModel.Entity.Id,
                userCreator = new
                {
                    id = dbJoinModel.Entity.UserCreator.Id,
                    imgContent = dbJoinModel.Entity.UserCreator.Image == null ? null : dbJoinModel.Entity.UserCreator.Image.Key,
                    userName = dbJoinModel.Entity.UserCreator.UserName,
                    nickname = dbJoinModel.Entity.UserCreator.Nickname,
                },
                key = dbJoinModel.Entity.Key,
                createDate = dbJoinModel.Entity.CreateDate
            });
        }

        [HttpDelete("delete")]
        public IActionResult DeleteJoinLink(string sId, string key)
        {
            if (string.IsNullOrWhiteSpace(sId))
                return BadRequest(new { errorText = "Parameter expected 'sId'." });
            if (string.IsNullOrWhiteSpace(key))
                return BadRequest(new { errorText = "Parameter expected 'key'." });
            DB.Images.ToList();
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage.Id.ToString() == sId && p.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            var joinModel = DB.StorageJoinLinks.FirstOrDefault(p => p.Key == key && p.Storage == userInStorage.Storage);
            if(joinModel == null)
                return BadRequest(new { errorText = "Join link isn't found." });

            DB.PermissionTemplates.ToList();
            if (userInStorage.Storage.Creator != getUserFromDB &&
                !DB.UserPermissions.Where(p =>
                    p.UserInStorage == userInStorage &&
                    p.PermissionTemplate.IsDeleteJoinURL
                ).Any())
            {
                return BadRequest(new { errorText = "Access denied." });
            }

            DB.StorageJoinLinks.Remove(joinModel);
            DB.SaveChanges();

            return Ok("Ok");
        }

        [AllowAnonymous]
        [HttpGet("info/{key}")]
        public IActionResult GetInfoJoin(string key)
        {
            DB.Images.ToList();
            DB.Storages.ToList();
            var storageJoinLinks = DB.StorageJoinLinks.FirstOrDefault(p => p.Key == key);
            if (storageJoinLinks == null)
                return BadRequest(new { errorText = "Storage isn't found." });
            var storage = storageJoinLinks.Storage;
            return Ok(new
            {
                id = storage.Id,
                name = storage.Name,
                uniqueName = storage.UniqueName,
                imgContent = storage.Image == null ? null : storage.Image.Key,
                type = storage.Type
            });
        }

        [HttpGet("{key}")]
        public IActionResult JoinToStorage(string key)
        {
            DB.Images.ToList();
            DB.Storages.ToList();
            var storageJoinLinks = DB.StorageJoinLinks.FirstOrDefault(p => p.Key == key);
            if (storageJoinLinks == null)
                return BadRequest(new { errorText = "Storage isn't found." });

            var storage = storageJoinLinks.Storage;

            if (DB.UserInStorages.Where(p => p.Storage == storage && p.User == getUserFromDB).Any())
                return BadRequest(new { errorText = "This user is already present." });

            var userInStorage = DB.UserInStorages.Add(new UserInStorageModel()
            {
                Storage = storage,
                User = getUserFromDB,
                DateOfEntry = DateTime.Now
            });

            DB.UserPermissions.Add(new UserPermissionsModel()
            {
                UserInStorage = userInStorage.Entity,
                PermissionTemplate = DB.PermissionTemplates.FirstOrDefault(p => p.Storage == storage && p.Name == "Default")
            });
            DB.SaveChanges();

            return Ok();
        }
    }
}
