﻿using ApiService.Models;
using ApiService.Models.View;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;

namespace ApiService.Controllers
{
    [Authorize]
    [Route("storage")]
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

        [HttpGet("{id}")]
        public IActionResult GetStorageInfo(string id)
        {
            DB.Images.ToList();
            var storage = DB.Storages.FirstOrDefault(p => p.Id.ToString() == id || (p.UniqueName == id && !p.IsPrivate));
            if(storage == null)
                return BadRequest(new { errorText = "Access denied." });
            var us = DB.UserInStorages.FirstOrDefault(p => p.Storage == storage && p.User == getUserFromDB);
            if (us == null)
                return BadRequest(new { errorText = "Access denied." });
            return Ok(new
            {
                createDate = us.DateOfEntry,
                id = us.Storage.Id,
                isPrivate = us.Storage.IsPrivate,
                status = (us.Storage.Type != StorageType.Private) ?
                                            DB.UserInStorages.Where(s => s.Storage == us.Storage).Count().ToString()
                                            : (DB.UserInStorages.FirstOrDefault(p => p.User != getUserFromDB).User.IsOnline ? "Online" :
                                                    DB.UserInStorages.FirstOrDefault(p => p.User != getUserFromDB).User.LastOnline.ToString()),
                imgContent = us.Storage.Image == null ? null : us.Storage.Image.Key,
                name = us.Storage.Type != StorageType.Private ? us.Storage.Name :
                                        DB.UserInStorages.FirstOrDefault(p => p.Storage == us.Storage && p.User != getUserFromDB).User.Nickname,
                type = us.Storage.Type,
                uniqueName = us.Storage.UniqueName
            });
        }
        [HttpGet("type/{id}")]
        public IActionResult GetTypeStorage(string id)
        {
            DB.Images.ToList();
            var storage = DB.Storages.FirstOrDefault(p => p.Id.ToString() == id || (p.UniqueName == id && !p.IsPrivate));
            if (storage == null)
                return BadRequest(new { errorText = "Access denied." });
            var us = DB.UserInStorages.FirstOrDefault(p => p.Storage == storage && p.User == getUserFromDB);
            if (us == null)
                return BadRequest(new { errorText = "Access denied." });
            if (storage.Type == StorageType.Private)
            {
                DB.Users.ToList();
                var user = DB.UserInStorages.FirstOrDefault(p => p.Storage == storage && p.User != getUserFromDB);
                return Ok(new
                {
                    type = StorageType.Private,
                    userId = user.User.Id
                });
            }
            return GetStorageInfo(id);
        }

        [HttpGet("list")]
        public IActionResult GetList()
        {
            DB.Images.ToList();
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
                                  imgContent = us.Storage.Image.Key,
                                  name = us.Storage.Type != StorageType.Private ? us.Storage.Name :
                                        DB.UserInStorages.FirstOrDefault(p => p.Storage == us.Storage && p.User != getUserFromDB).User.Nickname,
                                  type = us.Storage.Type,
                                  uniqueName = us.Storage.UniqueName
                              },
                              message = (from m in DB.Messages
                                         where m.Storage == us.Storage
                                         select new
                                         {
                                             sender = new 
                                             {
                                                 id = m.Sender.Id,
                                                 userName = m.Sender.UserName,
                                                 imgContent = m.Sender.Image == null ? null : m.Sender.Image.Key,
                                                 nickname = m.Sender.Nickname, 
                                             },
                                             sendDate = m.SendDate,
                                             type = m.Type,
                                             id = m.Id,
                                             textContent = m.TextContent,
                                             imgContent = m.ImgContent,
                                             fileUrl = m.FileUrl,
                                             fileName = System.IO.Path.GetFileName(m.FileSavePath)
                                         }).ToList()
                          }).ToList();
            return Ok(result);
        }

        [HttpGet("search")]
        public IActionResult SerachStorage(string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { errorText = "Parameter 'q' is empty!" });
            var result = (from u in DB.Users
                          where ((!string.IsNullOrWhiteSpace(u.UserName) && u.UserName.Contains(q)) ||
                                u.Nickname.Contains(q)) && u != getUserFromDB
                          select new SearchViewModel()
                          {
                              Id = u.Id,
                              Name = u.Nickname,
                              UniqueName = u.UserName,
                              ImgContent = u.Image.Key,
                              Type = SearchObjectType.Storage
                          }).ToList();
            result.AddRange((from s in DB.Storages
                      where !s.IsPrivate && (s.UniqueName.Contains(q) || s.Name.Contains(q))
                      select new SearchViewModel()
                      {
                          Id = s.Id,
                          Name = s.Name,
                          UniqueName = s.UniqueName,
                          ImgContent = s.Image.Key,
                          Type = SearchObjectType.User
                      }).ToList());
            result = result.OrderBy(p => p.UniqueName).Take(20).ToList();
            return Ok(result);
        }

        [HttpGet("user/list")]
        public IActionResult GetUserList(string sId)
        {
            var storage = DB.Storages.FirstOrDefault(s => s.Id.ToString() == sId);
            DB.Users.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage == storage && us.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            var result = (from u in DB.UserInStorages
                          where u.Storage == storage
                          select new
                          {
                              id = u.User.Id,
                              userName = u.User.UserName,
                              nickname = u.User.Nickname,
                              imgContent = u.User.Image.Key,
                              status = u.User.IsOnline ? "Online" : u.User.LastOnline.ToString()
                          }).ToList();

            return Ok(result);
        }

        [HttpPost("create")]
        public IActionResult CreateStorage(string name, string UName, bool IsPrivate, StorageType type)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Length < 4)
                return BadRequest(new { eerorText = "Name is too short." });
            if (!IsPrivate && string.IsNullOrWhiteSpace(UName))
                return BadRequest(new { errorText = "Expected parameter 'UName'." });

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
                IsSendFiles = type != StorageType.Channel,
                IsSendMessage = type != StorageType.Channel
            });
            DB.SaveChanges();
            DB.UserInStorages.Add(new UserInStorageModel()
            {
                User = getUserFromDB,
                Storage = storage.Entity,
                DateOfEntry = DateTime.Now
            });
            DB.SaveChanges();


            Hub.Groups.AddToGroupAsync(ChatHub.HubUser(getUserFromDB).ConnectionId, $"Storage_{storage.Entity.Id}");
            Hub.Clients.Client(ChatHub.HubUser(getUserFromDB).ConnectionId).SendAsync("receiveStorage", new {
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
    
        [HttpPost("join")]
        public IActionResult JoinToStorage(string sId, SearchObjectType objectType)
        {
            DB.Storages.ToList();
            switch (objectType)
            {
                case SearchObjectType.Storage:
                    #region Join to storage
                    if (DB.UserInStorages.FirstOrDefault(
                            p => p.User == getUserFromDB &&
                            p.Storage.Id.ToString() == sId) != null)
                        return Ok();
                    var selectStorage = DB.Storages.FirstOrDefault(p => !p.IsPrivate &&
                                                        p.Type != StorageType.Private &&
                                                        p.Id.ToString() == sId);
                    if (selectStorage == null)
                        return BadRequest(new { errorText = "Access denied." });

                    var us = DB.UserInStorages.Add(new UserInStorageModel()
                    {
                        DateOfEntry = DateTime.Now,
                        User = getUserFromDB,
                        Storage = selectStorage
                    });
                    DB.UserPermissions.Add(new UserPermissionsModel()
                    {
                        UserInStorage = us.Entity,
                        PermissionTemplate = DB.PermissionTemplates.FirstOrDefault(p => p.Storage == selectStorage &&
                                                                                   p.Name == "Default")
                    });
                    DB.SaveChanges();
                    Hub.Groups.AddToGroupAsync(ChatHub.HubUser(getUserFromDB).ConnectionId, $"Storage_{us.Entity.Storage.Id}");
                    Hub.Clients.Client(ChatHub.HubUser(getUserFromDB).ConnectionId).SendAsync("receiveStorage", new {
                        createDate = us.Entity.DateOfEntry,
                        id = us.Entity.Storage.Id,
                        isPrivate = us.Entity.Storage.IsPrivate,
                        status = DB.UserInStorages.Where(s => s.Storage == us.Entity.Storage).Count().ToString(),
                        imgContent = us.Entity.Storage.Image == null ? null : us.Entity.Storage.Image.Key,
                        name = us.Entity.Storage.Name,
                        type = us.Entity.Storage.Type,
                        uniqueName = us.Entity.Storage.UniqueName
                    });
                    #endregion
                    break;
                case SearchObjectType.User:
                    //TO DO
                    var selectUser = DB.Users.FirstOrDefault(u => u.Id.ToString() == sId);
                    var myPrivate = DB.Storages.FirstOrDefault(s => s == (
                        DB.UserInStorages.FirstOrDefault(us => 
                            (us.User == getUserFromDB || us.User == selectUser) &&
                            us.Storage.Type == StorageType.Private).Storage
                        )
                    );
                    if(myPrivate == null)
                    {
                        DB.ContactLists.Add(new ContactListModel()
                        {
                            FirstUser = getUserFromDB,
                            SecondUser = selectUser
                        });
                    }           
                    break;
            }
            return Ok();
        }

        [HttpPost("edit")]
        public IActionResult EditStorage(string sID, string name, string UName, bool IsPrivate)
        {
            var storage = DB.Storages.FirstOrDefault(p => p.Id.ToString() == sID);
            var userStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage == storage && p.User == getUserFromDB);
            if (userStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            if (storage.Creator != getUserFromDB)
            {
                if (!DB.UserPermissions.Where(p => p.UserInStorage == userStorage &&
                                      p.PermissionTemplate.IsRenameStorage).Any())
                    return BadRequest(new { errorText = "Access denied." });
            }

            if(!IsPrivate && !string.IsNullOrWhiteSpace(UName))
            {
                storage.IsPrivate = IsPrivate;
                storage.UniqueName = UName;
            }

            if (!string.IsNullOrWhiteSpace(name))
                storage.Name = name;

            DB.SaveChanges();

            return Ok();
        }

        [HttpPost("preview")]
        public IActionResult PreviewStorage(string sId)
        {
            var storage = DB.Storages.FirstOrDefault(p => p.Id.ToString() == sId &&
                                    !p.IsPrivate && p.Type != StorageType.Private);
            if (storage == null)
                return BadRequest(new { errorText = "Access denied." });

            var messages = (from m in DB.Messages
                            where m.Storage == storage
                            select new
                            {
                                sender = m.Sender,
                                sendDate = m.SendDate,
                                type = m.Type,
                                id = m.Id,
                                textContent = m.TextContent,
                                imgContent = m.ImgContent,
                                fileUrl = m.FileUrl
                            }).ToList();

            return Ok(messages);
        }

        [HttpPost("leave")]
        public IActionResult LeaveStorage(string sId)
        {
            var storage = DB.Storages.FirstOrDefault(p => p.Id.ToString() == sId);
            if (storage == null)
                return BadRequest(new { errorText = "Incorrect storage id." });
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage == storage && p.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            Hub.Groups.RemoveFromGroupAsync(ChatHub.HubUser(getUserFromDB).ConnectionId, $"Storage_{sId}");
            Hub.Clients.Client(ChatHub.HubUser(getUserFromDB).ConnectionId).SendAsync("deleteStorage", sId);

            DB.UserPermissions.Remove(DB.UserPermissions.FirstOrDefault(p => p.UserInStorage == userInStorage));
            DB.UserInStorages.Remove(userInStorage);
            DB.SaveChanges();

            return Ok();
        }

        [HttpDelete("delete")]
        public IActionResult DeleteStorage(string sId)
        {
            var storage = DB.Storages.FirstOrDefault(p => p.Id.ToString() == sId);
            var userStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage == storage && p.User == getUserFromDB);
            if (userStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            DB.Users.ToList();
            if (storage.Creator != getUserFromDB && storage.Type != StorageType.Private)
                return BadRequest(new { errorText = "Access denied." });

            var users = DB.UserInStorages.Where(p => p.Storage == storage);
       
            foreach (var user in users) 
            {
                var hubUser = ChatHub.HubUser(user.User);
                if (hubUser != default)
                {
                    Hub.Clients.Client(hubUser.ConnectionId).SendAsync("deleteStorage", sId);
                    Hub.Groups.RemoveFromGroupAsync(hubUser.ConnectionId, $"Storage_{sId}");
                }
            }

            DB.UserPermissions.RemoveRange(DB.UserPermissions.Where(p => p.UserInStorage.Storage == storage));
            DB.PermissionTemplates.RemoveRange(DB.PermissionTemplates.Where(p => p.Storage == storage));
            DB.UserInStorages.RemoveRange(users);
            DB.StorageLogs.RemoveRange(DB.StorageLogs.Where(p => p.Storage == storage));
            DB.StorageJoinLinks.RemoveRange(DB.StorageJoinLinks.Where(p => p.Storage == storage));
            DB.Messages.RemoveRange(DB.Messages.Where(p => p.Storage == storage));
            DB.Images.RemoveRange(DB.Images.Where(p => p.Id == storage.Id));
            DB.Storages.Remove(storage);

            DB.SaveChanges();

            return Ok();
        }
    }
}
