using System;
using System.ComponentModel.DataAnnotations;

namespace ApiService.Models.Cache
{
    public class ConfirmEventModel
    {
        public bool IsActivated { get; set; }
        public string EventName { get; set; }
        public string Key { get; set; }
        public UserModel User { get; set; }
    }
}
