using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatServer.Controllers
{
    [Authorize]
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        DBContext DB;
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        public UserController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [HttpGet("my")]
        public IActionResult GetUserInfo()
        {
            var user = DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user == null)
                return BadRequest();
            return Ok(new
            {
                nickname = user.Nickname,
                userName = user.UserName,
                email = user.Email,
                deleteIfMissingFromMonths = user.DeleteIfMissingFromMonths,
                imgContent = user.ImgContent
            });
        }

        [HttpPost("my/password/set")]
        public IActionResult SetPassword(string newP, string oldP)
        {
            var user = getUserFromDB;
            if (user.Password != oldP)
                return BadRequest(new { errorText = "Incorrect old password." });
            DB.Users.FirstOrDefault(u => u == user).Password = newP;
            DB.SaveChanges();
            return Ok();
        }
    }
}
