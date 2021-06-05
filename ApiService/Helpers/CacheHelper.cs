using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ApiService.Models.Cache;

namespace ApiService.Helpers
{
    public static class CacheHelper
    {
        public static string CreateCacheKeyString(ConfirmEventModel confirmEventModel)
        {
            return CreateCacheKeyString(confirmEventModel.User.Email, confirmEventModel.EventName);
        }
        public static string CreateCacheKeyString(string email, string eventName)
        {
            return $"{email}_${eventName}";
        }
    }
}
