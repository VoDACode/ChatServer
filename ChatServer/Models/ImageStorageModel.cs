using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatServer.Models
{
    public class ImageStorageModel
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public string Image { get; set; }
    }
}
