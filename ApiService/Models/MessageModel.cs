using System;

namespace ApiService.Models
{
    public enum MessageType { File, Text, Post }
    public class MessageModel
    {
        public int Id { get; set; }
        public string TextContent { get; set; }
        public string ImgContent { get; set; }
        public string FileSavePath { get; set; }
        public string FileUrl { get; set; }
        public MessageType Type { get; set; }
        public DateTime SendDate { get; set; }
        public UserModel Sender { get; set; }
        public StorageModel Storage { get; set; }
    }
}
