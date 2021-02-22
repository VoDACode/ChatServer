using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;

namespace ChatServer.Controllers
{
    [Authorize]
    [Route("api/message")]
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

            if (storage.Creator != getUserFromDB)
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

            var message = DB.Messages.Add(new MessageModel()
            {
                TextContent = textContent.Replace("&", "&amp").Replace("<", "&lt").Replace(">", "&gt"),
                Storage = storage,
                SendDate = DateTime.Now,
                Sender = getUserFromDB,
                Type = messageType
            });
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
                    fileUrl = message.Entity.FileUrl
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

            if (userInStorage.Storage.Creator != getUserFromDB)
            {
                if (message.Sender != getUserFromDB && DB.UserPermissions.FirstOrDefault(p => p.UserInStorage == userInStorage
                     && p.PermissionTemplate.IsDeleteMessages) == null)
                    return BadRequest(new { errorText = "No permission to delete messages!" });
            }

            hub.Clients.Group($"Storage_{sID}").SendAsync("deleteMessage", mID, sID);

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
    }
}
