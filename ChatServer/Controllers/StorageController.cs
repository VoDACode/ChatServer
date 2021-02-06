using ChatServer.Models;
using ChatServer.Models.View;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;

namespace ChatServer.Controllers
{
    [Authorize]
    [Route("api/storage")]
    [ApiController]
    public class StorageController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        IHubContext<ChatHub> Hub;
        public StorageController(DBContext dBContext, IHubContext<ChatHub> hub)
        {
            DB = dBContext;
            this.Hub = hub;
        }

        [HttpGet("list")]
        public IActionResult GetList()
        {
            DB.Storages.ToList();
            var result = (from us in DB.UserInStorages
                          where us.User == getUserFromDB
                          select new
                          {
                              storage = new
                              {
                                  createDate = us.DateOfEntry,
                                  id = us.Storage.Id,
                                  isPrivate = us.Storage.IsPrivate,
                                  status = (us.Storage.Type != StorageType.Private) ?
                                            DB.UserInStorages.Where(s => s.Storage == us.Storage).Count().ToString()
                                            : (DB.UserInStorages.FirstOrDefault(p => p.User != getUserFromDB).User.IsOnline ? "Online" :
                                                    DB.UserInStorages.FirstOrDefault(p => p.User != getUserFromDB).User.LastOnline.ToString()),
                                  imgContent = us.Storage.ImgContent,
                                  name = us.Storage.Name,
                                  type = us.Storage.Type,
                                  uniqueName = us.Storage.UniqueName
                              },
                              message = (from m in DB.Messages
                                         where m.Storage == us.Storage
                                         select new
                                         {
                                             sender = m.Sender,
                                             sendDate = m.SendDate,
                                             type = m.Type,
                                             id = m.Id,
                                             textContent = m.TextContent,
                                             imgContent = m.ImgContent,
                                             fileUrl = m.FileUrl
                                         }).ToList()
                          }).ToList();
            return Ok(result);
        }

        [Route("/api/search")]
        public IActionResult SerachStorage(string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { errorText = "Parameter 'q' is empty!" });
            var result = (from u in DB.Users
                          where (!string.IsNullOrWhiteSpace(u.UserName) && u.UserName.Contains(q)) || u.Nickname.Contains(q)
                          select new SearchViewModel()
                          {
                              Id = u.Id,
                              Name = u.Nickname,
                              UniqueName = u.UserName,
                              ImgContent = u.ImgContent,
                              Type = SearchObjectType.Storage
                          }).ToList();
            result.AddRange((from s in DB.Storages
                      where !s.IsPrivate && (s.UniqueName.Contains(q) || s.Name.Contains(q))
                      select new SearchViewModel()
                      {
                          Id = s.Id,
                          Name = s.Name,
                          UniqueName = s.UniqueName,
                          ImgContent = s.ImgContent,
                          Type = SearchObjectType.User
                      }).ToList());
            result = result.OrderBy(p => p.UniqueName).Take(20).ToList();
            return Ok(result);
        }

        [HttpPost("create")]
        public IActionResult CreateStorage(string connectionId, string name, string UName, bool IsPrivate, StorageType type)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Length < 4)
                return BadRequest(new { eerorText = "Name is too short." });
            if (!IsPrivate && string.IsNullOrWhiteSpace(UName))
                return BadRequest(new { errorText = "Expected parameter 'UName'." });
            if(string.IsNullOrWhiteSpace(connectionId))
                return BadRequest(new { errorText = "Expected parameter 'connectionId'." });

            if (!IsPrivate && DB.Storages.FirstOrDefault(s => s.UniqueName == UName && !s.IsPrivate) != null)
                return BadRequest(new { errorText = "This UniqueName is already taken." });

            var storage = DB.Storages.Add(new StorageModel()
            {
                CreateDate = DateTime.Now,
                IsPrivate = IsPrivate,
                UniqueName = IsPrivate ? string.Empty : UName,
                Name = name,
                Type = type,
                Creator = getUserFromDB
            });
            DB.SaveChanges();
            DB.PermissionTemplates.Add(new PermissionTemplateModel()
            {
                Name = "Default",
                Storage = storage.Entity,
                IsCopyJoinURL = !IsPrivate,
                IsSendFiles = true,
                IsSendMessage = true
            });
            DB.SaveChanges();
            DB.UserInStorages.Add(new UserInStorageModel()
            {
                User = getUserFromDB,
                Storage = storage.Entity,
                DateOfEntry = DateTime.Now
            });
            DB.SaveChanges();


            Hub.Groups.AddToGroupAsync(connectionId, $"Storage_{storage.Entity.Id}");
            Hub.Clients.Client(connectionId).SendAsync("receiveStorage", new {
                id = storage.Entity.Id,
                createDate = storage.Entity.CreateDate,
                isPrivate = storage.Entity.IsPrivate,
                status = "",
                imgContent = "",
                name = storage.Entity.Name,
                type = storage.Entity.Type,
                uniqueName = storage.Entity.UniqueName
            });
            return Ok();
        }
    }
}
