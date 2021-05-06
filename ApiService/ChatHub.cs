using ApiService.Models;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiService
{
    [Authorize]
    public class ChatHub : Hub
    {
        private static List<HubUserModel> hubUsers = new List<HubUserModel>();
        public static IReadOnlyList<HubUserModel> HubUsers { get => hubUsers; }
        DBContext DB;
        IHubContext<ChatHub> Hub;
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == Context.User.Identity.Name); }

        public static HubUserModel HubUser(string Email)
        {
            return HubUsers.FirstOrDefault(p => p.Email == Email);
        }
        public static HubUserModel HubUser(UserModel user)
        {
            if (user == default)
                return null;
            return HubUsers.FirstOrDefault(p => p.Email == user.Email);
        }

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
            Clients.Group($"UserStatus_{getUserFromDB.Id}").SendAsync("UpdateUserStatus", new
            {
                uID = getUserFromDB.Id,
                status = true
            });

            //TEMP_AddSavedMessage();

            var thisUser = getUserFromDB;
            DB.Storages.ToList();
            var contacts = DB.UserInStorages.Where(c => c.User == thisUser);
            foreach (var item in contacts)
            {
                //sub to a message 
                Groups.AddToGroupAsync(Context.ConnectionId, $"Storage_{item.Storage.Id}");      
                //sub to user status
                /*
                if (item.Storage.Type == StorageType.Private) {
                    var user = DB.UserInStorages.FirstOrDefault(s => s.Id == item.Id && s.User != thisUser).User;
                    Groups.AddToGroupAsync(Context.ConnectionId, $"UserStatus_{user.Id}");
                }
                */
            }
            var user = hubUsers.FirstOrDefault(p => p.Email == thisUser.Email);
            if(user == default)
            {
                hubUsers.Add(new HubUserModel()
                {
                    Email = thisUser.Email,
                    ConnectionId = Context.ConnectionId
                });
            }
            else
            {
                user.ConnectionId = Context.ConnectionId;
            }

            return base.OnConnectedAsync();
        }
        public override Task OnDisconnectedAsync(Exception exception)
        {
            return base.OnDisconnectedAsync(exception);
        }

        private void TEMP_AddSavedMessage()
        {
            if (!DB.UserInStorages.Where(p => p.User == getUserFromDB &&
        p.Storage.IsPrivate && p.Storage.Type == StorageType.Private && p.Storage.Name == "{MY_SAVED_MESSAGES}").Any())
            {
                var mySavedMessages = DB.Storages.Add(new StorageModel()
                {
                    Creator = getUserFromDB,
                    Name = "{MY_SAVED_MESSAGES}",
                    IsPrivate = true,
                    Type = StorageType.Private,
                    CreateDate = DateTime.Now,
                });
                DB.UserInStorages.Add(new UserInStorageModel()
                {
                    DateOfEntry = DateTime.Now,
                    User = getUserFromDB,
                    Storage = mySavedMessages.Entity
                });
                DB.SaveChanges();
            }
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
