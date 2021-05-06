using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace VoiceService.Models
{
    class RoomModel
    {
        public string Id { get; set; }
        public List<TcpClient> Clients { get; set; } = new List<TcpClient>();

        public TcpClient GetClient(TcpClient client)
        {
            return Clients.FirstOrDefault(p => p == client);
        }
    }
}
