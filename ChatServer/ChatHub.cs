using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatServer
{
    [Authorize]
    public class ChatHub : Hub
    {
        DBContext DB;
        IHubContext<ChatHub> Hub;
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == Context.User.Identity.Name); }

        public ChatHub(DBContext dBContext, IHubContext<ChatHub> hub)
        {
            DB = dBContext;
            this.Hub = hub;
        }
        public override Task OnConnectedAsync()
        {
            getUserFromDB.IsOnline = true;
            getUserFromDB.LastOnline = DateTime.Now;
            Clients.Group($"UserStatus_{getUserFromDB.Id}").SendAsync("UpdateUserStatus", new
            {
                uID = getUserFromDB.Id,
                status = true
            });
            DB.SaveChanges();

            DB.Storages.ToList();
            var contacts = DB.UserInStorages.Where(c => c.User == getUserFromDB);
            foreach (var item in contacts)
            {
                //sub to a message 
                Groups.AddToGroupAsync(Context.ConnectionId, $"Storage_{item.Storage.Id}");
                //sub to user status
                if (item.Storage.Type == StorageType.Private) {
                    var user = DB.UserInStorages.FirstOrDefault(s => s.Id == item.Id && s.User != getUserFromDB).User;
                    Groups.AddToGroupAsync(Context.ConnectionId, $"UserStatus_{user.Id}");
                }
            }

            return base.OnConnectedAsync();
        }
        public override Task OnDisconnectedAsync(Exception exception)
        {
            return base.OnDisconnectedAsync(exception);
        }

        public void LeaveMessenger()
        {
            var user = getUserFromDB;
            user.IsOnline = false;
            user.LastOnline = DateTime.Now;
            DB.SaveChanges();
            Clients.Group($"UserStatus_{getUserFromDB.Id}").SendAsync("UpdateUserStatus", new
            {
                uID = getUserFromDB.Id,
                status = false,
                lastOnline = user.LastOnline
            });
        }

        public Task GetConnectionId()
        {
            return Clients.Caller.SendAsync("receiveConnectionId", Context.ConnectionId);
        }
    }
}
