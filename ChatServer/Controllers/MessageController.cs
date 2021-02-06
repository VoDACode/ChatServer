using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ChatServer.Controllers
{
    [Authorize]
    [Route("api/message")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        IHubContext<ChatHub> Hub;
        public MessageController(DBContext dBContext, IHubContext<ChatHub> hub)
        {
            DB = dBContext;
            this.Hub = hub;
        }

        [HttpPost("post")]
        public IActionResult PostMessage(string sID, string textContent, IFormFile file)
        {
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
                TextContent = textContent,
                Storage = storage,
                SendDate = DateTime.Now,
                Sender = getUserFromDB,
                Type = messageType
            });
            DB.SaveChanges();
            Hub.Clients.Groups($"Storage_{sID}").SendAsync("receiveMessage", new
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
                    imgContent = message.Entity.Sender.ImgContent,
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

    }
}
