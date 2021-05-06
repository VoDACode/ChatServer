using ApiService.Models;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Linq;

namespace ApiService.Controllers
{
    [Authorize]
    [Route("message")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        IHubContext<ChatHub> hub;
        public MessageController(DBContext dBContext, IHubContext<ChatHub> hub)
        {
            DB = dBContext;
            this.hub = hub;
        }

        [HttpPost("post/private")]
        public IActionResult PostPrivateMessage(string uID, string textContent, IFormFile file)
        {
            var user = DB.Users.FirstOrDefault(p => p.Id.ToString() == uID);
            if (user == getUserFromDB)
                return Ok();
            var storages = DB.Storages.Where(s => s == (
                        DB.UserInStorages.FirstOrDefault(us =>
                            us.User == getUserFromDB &&
                            us.Storage.Type == StorageType.Private).Storage
                        )
                    ).ToList();
            var userStorage = DB.UserInStorages.FirstOrDefault(us =>
                us.User == user &&
                us.Storage.Type == StorageType.Private);
            StorageModel storage = default;
            if (userStorage != null)
            {
                storage = storages.FirstOrDefault(s => s == userStorage.Storage);
            }

            if (!storages.Any() || storage == null)
            {
                var createStorage = DB.Storages.Add(new StorageModel()
                {
                    CreateDate = DateTime.Now,
                    Creator = getUserFromDB,
                    IsPrivate = true,
                    Type = StorageType.Private,
                    Name = "{name}"
                });
                DB.SaveChanges();

                DB.UserInStorages.Add(new UserInStorageModel()
                {
                    DateOfEntry = DateTime.Now,
                    User = getUserFromDB,
                    Storage = createStorage.Entity,
                });
                DB.UserInStorages.Add(new UserInStorageModel()
                {
                    DateOfEntry = DateTime.Now,
                    User = user,
                    Storage = createStorage.Entity,
                });
                DB.SaveChanges();

                var connection = ChatHub.HubUser(getUserFromDB);
                if (connection != null)
                {
                    hub.Groups.AddToGroupAsync(connection.ConnectionId, $"Storage_{createStorage.Entity.Id}");
                    hub.Clients.Client(connection.ConnectionId).SendAsync("receiveStorage", new 
                    {
                        id = createStorage.Entity.Id,
                        isPrivate = createStorage.Entity.IsPrivate,
                        status = "",
                        imgContent = createStorage.Entity.Image == null ? null : createStorage.Entity.Image.Key,
                        name = user.Nickname,
                        type = StorageType.Private
                    });
                }
                connection = ChatHub.HubUser(user);
                if (connection != null)
                {
                    hub.Groups.AddToGroupAsync(connection.ConnectionId, $"Storage_{createStorage.Entity.Id}");
                    hub.Clients.Client(connection.ConnectionId).SendAsync("receiveStorage", new
                    {
                        id = createStorage.Entity.Id,
                        isPrivate = createStorage.Entity.IsPrivate,
                        status = "",
                        imgContent = createStorage.Entity.Image == null ? null : createStorage.Entity.Image.Key,
                        name = getUserFromDB.Nickname,
                        type = StorageType.Private
                    });
                }
                return PostMessage(createStorage.Entity.Id.ToString(), textContent, file);
            }

            return PostMessage(storage.Id.ToString(), textContent, file);
        }

        [HttpPost("post")]
        public IActionResult PostMessage(string sID, string textContent, IFormFile file)
        {
            DB.Images.ToList();
            DB.Users.ToList();
            var storage = DB.Storages.FirstOrDefault(s => s.Id.ToString() == sID);
            if (storage == null)
                return BadRequest(new { errorText = "Incorrect sID." });
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage == storage && us.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            if (storage.Creator != getUserFromDB && storage.Type != StorageType.Private)
            {
                if (DB.UserPermissions.FirstOrDefault(p => p.UserInStorage == userInStorage
                     && p.PermissionTemplate.IsSendMessage) == null)
                    return BadRequest(new { errorText = "No permission to send messages!" });
            }

            if(file == null && string.IsNullOrWhiteSpace(textContent))
                return BadRequest(new { errorText = "You are not sending anything!" });

            MessageType messageType = MessageType.Text;
            if (file != null)
                messageType = MessageType.File;
            var messageModel = new MessageModel()
            {
                TextContent = textContent == null ? null : textContent.Replace("&", "&amp").Replace("<", "&lt").Replace(">", "&gt"),
                Storage = storage,
                SendDate = DateTime.Now,
                Sender = getUserFromDB,
                Type = messageType
            };
            if (messageType == MessageType.File)
            {
                messageModel.FileUrl = "".RandomString(32);
                messageModel.FileSavePath = $"{Config.FileSaveDir}{messageModel.FileUrl}\\{file.FileName}";
                System.IO.Directory.CreateDirectory($"{Config.FileSaveDir}{messageModel.FileUrl}");
                using (var stream = file.OpenReadStream())
                {
                    byte[] buffer = new byte[stream.Length];
                    stream.Read(buffer, 0, buffer.Length);
                    System.IO.File.WriteAllBytesAsync(messageModel.FileSavePath, buffer);
                }
                
            }

            var message = DB.Messages.Add(messageModel);
            DB.SaveChanges();
            hub.Clients.Groups($"Storage_{sID}").SendAsync("receiveMessage", new
            {
                message = new
                {
                    sendDate = message.Entity.SendDate,
                    type = message.Entity.Type,
                    id = message.Entity.Id,
                    textContent = message.Entity.TextContent,
                    imgContent = message.Entity.ImgContent,
                    fileUrl = message.Entity.FileUrl,
                    fileName = System.IO.Path.GetFileName(message.Entity.FileSavePath)
                },
                sender = new
                {
                    id = message.Entity.Sender.Id,
                    userName = message.Entity.Sender.UserName,
                    imgContent = message.Entity.Sender.Image == null ? null : message.Entity.Sender.Image.Key,
                    nickname = message.Entity.Sender.Nickname,
                    deleteIfMissingFromMonths = message.Entity.Sender.DeleteIfMissingFromMonths
                },
                storage = new
                {
                    id = storage.Id
                }
            });
            return Ok();
        }     

        [HttpPost("delete")]
        public IActionResult DeleteMessage(string sID, string mID)
        {
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage.Id.ToString() == sID && p.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            var message = DB.Messages.FirstOrDefault(m => m.Id.ToString() == mID);
            if (message == null)
                return BadRequest(new { errorText = "Incorrect message id!" });

            if (userInStorage.Storage.Creator != getUserFromDB && userInStorage.Storage.Type != StorageType.Private)
            {
                if (message.Sender != getUserFromDB && DB.UserPermissions.FirstOrDefault(p => p.UserInStorage == userInStorage
                     && p.PermissionTemplate.IsDeleteMessages) == null)
                    return BadRequest(new { errorText = "No permission to delete messages!" });
            }

            hub.Clients.Group($"Storage_{sID}").SendAsync("deleteMessage", mID, sID);

            if(message.Type == MessageType.File)
            {
                System.IO.File.Delete(message.FileSavePath);
                System.IO.Directory.Delete($"{Config.FileSaveDir}{message.FileUrl}");
            }

            DB.Messages.Remove(message);
            DB.SaveChanges();
            return Ok();
        }

        [HttpPost("edit")]
        public IActionResult EditMessage(string sID, string mID, string newText)
        {
            if (string.IsNullOrWhiteSpace(newText))
                return BadRequest(new { errorText = "'newText' is empty!" });
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage.Id.ToString() == sID && p.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });

            var message = DB.Messages.FirstOrDefault(m => m.Id.ToString() == mID);
            if (message == null)
                return BadRequest(new { errorText = "Incorrect message id!" });

            if(message.Sender != getUserFromDB)
                return BadRequest(new { errorText = "Access denied." });
            message.TextContent = newText;
            DB.SaveChanges();
            hub.Clients.Group($"Storage_{sID}").SendAsync("editMessage", sID, mID, newText);
            return Ok();
        }

        [HttpGet("list")]
        public IActionResult GetMessageList(string sID, int limit)
        {
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.Storage.Id.ToString() == sID && p.User == getUserFromDB);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            var result = (from m in DB.Messages
                       where m.Storage == userInStorage.Storage
                       select new
                       {
                           sender = m.Sender,
                           sendDate = m.SendDate,
                           type = m.Type,
                           id = m.Id,
                           textContent = m.TextContent,
                           imgContent = m.ImgContent,
                           fileUrl = m.FileUrl,
                           fileName = System.IO.Path.GetFileName(m.FileSavePath)
                       }).Take(limit).ToList();
            return Ok(result);
        }
    }
}
