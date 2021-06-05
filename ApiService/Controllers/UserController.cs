using ApiService.Models;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiService.Controllers
{
    [Authorize]
    [Route("user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        DBContext DB;
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        public UserController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [HttpGet("info/{id}")]
        public IActionResult GetUserInfo(string id)
        {
            DB.Images.ToList();
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { errorText = "User isn't selected." });
            var result = DB.Users.FirstOrDefault(u => u.Id.ToString() == id ||
                (!string.IsNullOrWhiteSpace(u.UserName) && u.UserName == id));
            if (result == null)
                return BadRequest(new { errorText = $"User '{id}' isn't found." });
            return Ok(new
            {
                result.Id,
                imgContent = result.Image == null ? null : result.Image.Key,
                result.IsOnline,
                result.LastOnline,
                result.Nickname,
                result.UserName
            });
        }

        [HttpGet("my")]
        public IActionResult GetUserInfo()
        {
            DB.Images.ToList();
            var user = DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name);
            if (user == null)
                return BadRequest();
            return Ok(new
            {
                id = user.Id,
                nickname = user.Nickname,
                userName = user.UserName,
                email = user.Email,
                deleteIfMissingFromMonths = user.DeleteIfMissingFromMonths,
                imgContent = user.Image == null ? null : user.Image.Key
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

        [HttpPost("my/username/set")]
        public IActionResult SetUserName(string val)
        {
            if (string.IsNullOrWhiteSpace(val) && val.Length > 4)
                return BadRequest(new { errorText = "Incorrect parameter 'val'." });
            if (DB.Users.Where(o => o.UserName == val).Any())
                return BadRequest(new { errorText = "This username is taken." });
            getUserFromDB.UserName = val;
            DB.SaveChanges();
            return Ok();
        }

        [HttpPost("my/nickname/set")]
        public IActionResult SetNickname(string val)
        {
            if (string.IsNullOrWhiteSpace(val) && val.Length > 4)
                return BadRequest(new { errorText = "Incorrect parameter 'val'." });

            getUserFromDB.Nickname = val;
            DB.SaveChanges();
            return Ok();
        }

        [HttpPost("my/email/set")]
        public IActionResult SetEmail(string val)
        {
            //check taken email
            if (DB.Users.Where(u => u.Email == val).Any() || getUserFromDB.Email == val)
                return BadRequest(new { errorText = "This username is taken." });
            //append cookies 'confirm_key' and 'confirm_set_email'
            var uKey = "".RandomString(32);
            var lKey = "".RandomString(16);
            HttpContext.Response.Cookies.Append("confirm_key", uKey);
            HttpContext.Response.Cookies.Append("confirm_set_email", val);
            //add confirm to DB
            DB.ConfirmEmails.Add(new ConfirmEmailModel()
            {
                CreateDate = DateTime.Now,
                User = getUserFromDB,
                LinkKey = lKey,
                UserKey = uKey
            });
            DB.SaveChanges();
            //send confirm email
            var host = HttpContext.Request.Host;
            MailService.SendAsyn(val, "Confirm the set email address!", $"https://{host.Host}:{host.Port}/confirm/email/{lKey}");
            return Ok();
        }

        [HttpPost("my/img/set")]
        public IActionResult SetImg(IFormFile img)
        {
            using(var fs = img.OpenReadStream())
            {
                byte[] buffer = new byte[fs.Length];
                fs.Read(buffer, 0, buffer.Length);
                string Base64Img = "data:image/jpg;base64," + Convert.ToBase64String(buffer);
                var imageInDb = DB.Images.Add(new ImageStorageModel()
                {
                    Key = "".RandomString(18),
                    Image = Base64Img
                });
                DB.SaveChanges();
                getUserFromDB.Image = imageInDb.Entity;
                DB.SaveChanges();
            }          
            return Ok();
        }
    }
}
