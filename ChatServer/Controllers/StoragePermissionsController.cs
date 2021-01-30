using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ChatServer.Controllers
{
    [Route("api/storage/permission")]
    [ApiController]
    public class StoragePermissionsController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        public StoragePermissionsController(DBContext dBContext)
        {
            DB = dBContext;
        }
        [HttpGet("me/list")]
        public IActionResult getMyPermissions(string sID)
        {
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(us => us.Storage.Id.ToString() == sID);
            // TO DO
            return Ok();
        }
    }
}
