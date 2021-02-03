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
            DB.SaveChanges();
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
        }

        public Task GetConnectionId()
        {
            return Clients.Caller.SendAsync("receiveConnectionId", Context.ConnectionId);
        }
    }
}
