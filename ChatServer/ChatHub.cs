using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatServer
{
    public class ChatHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            
            return base.OnConnectedAsync();
        }
    }
}
