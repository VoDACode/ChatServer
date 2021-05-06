using ApiService.Models;
using ApiService.Options;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ApiService.Controllers
{
    [Route("/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        DBContext DB;
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        public AuthController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [HttpPost("auth")]
        public IActionResult Authenticate(string email, string password)
        {
            var token = CreateToken(email, password);
            if (token == null)
                return BadRequest(new { errorText = "Invalid email or password." });

            return Ok(new { token = token });
        }

        [HttpPost("register")]
        public IActionResult Registration(string email, string password, string userName, string nickName)
        {
            if (DB.Users.FirstOrDefault(u => u.Email == email) != null)
                return BadRequest(new { errorText = "This email address is already taken." });
            if (!string.IsNullOrWhiteSpace(userName) && DB.Users.FirstOrDefault(u => u.UserName == userName) != null)
                return BadRequest(new { errorText = "This user name is already taken." });

            var user = DB.Users.Add(new UserModel()
            {
                DeleteIfMissingFromMonths = 6,
                Email = email,
                UserName = userName,
                Nickname = nickName,
                Password = password
            }).Entity;
            DB.SaveChanges();

            string uKey = "".RandomString(32);
            string lKey = "".RandomString(24);

            DB.ConfirmEmails.Add(new ConfirmEmailModel()
            {
                CreateDate = DateTime.Now,
                User = user,
                LinkKey = lKey,
                UserKey = uKey
            });

            //var mySavedMessages = DB.Storages.Add(new StorageModel()
            //{
            //    Creator = user,
            //    Name = "{MY_SAVED_MESSAGES}",
            //    IsPrivate = true,
            //    Type = StorageType.Private,
            //    CreateDate = DateTime.Now,
            //});
            //DB.UserInStorages.Add(new UserInStorageModel()
            //{
            //    DateOfEntry = DateTime.Now,
            //    User = user,
            //    Storage = mySavedMessages.Entity
            //});

            DB.SaveChanges();
            var host = HttpContext.Request.Host;
            MailService.SendAsyn(email, "Confirm email!", $"https://{host.Host}:{host.Port}/confirm/email/{lKey}");
            HttpContext.Response.Cookies.Append("confirm_key", uKey);
            return Ok(new { userKey = uKey });
        }

        [HttpDelete("logout")]
        public IActionResult Logout()
        {
            string token = HttpContext.Request.Cookies["auth_token"];
            var session = DB.UserSessions.FirstOrDefault(o => o.Token == token);
            if (session != null)
            {
                DB.UserSessions.Remove(session);
                DB.SaveChanges();
            }
            HttpContext.Response.Cookies.Delete("auth_token");
            return Redirect("/");
        }

        [HttpGet("isValid")]
        public IActionResult ValidToken()
        {
            return Ok(new { status = User.Identity.IsAuthenticated });
        }

        [HttpGet]
        [Route("/confirm/email/{lKey}")]
        public IActionResult ConfirmEmail(string lKey)
        {
            var uKey = HttpContext.Request.Cookies["confirm_key"];
            DB.Users.ToList();
            var confirm = DB.ConfirmEmails.FirstOrDefault(c => c.LinkKey == lKey && c.UserKey == uKey);
            if (confirm == null)
                return Redirect("/");

            HttpContext.Response.Cookies.Delete("confirm_key");
            // Confirm set email
            var email = HttpContext.Request.Cookies["confirm_set_email"];
            if (!string.IsNullOrWhiteSpace(email))
            {
                getUserFromDB.Email = email;
                DB.SaveChanges();
                HttpContext.Response.Cookies.Delete("confirm_set_email");
                return Redirect("/");
            }

            var token = CreateToken(confirm.User.Email, confirm.User.Password);
            if (token == null)
                return Redirect("/");
            HttpContext.Response.Cookies.Append("auth_token", token);

            return Redirect("/");
        }

        private string CreateToken(string email, string password)
        {
            var identity = GetIdentity(email, password);
            if (identity == null)
                return null;

            var now = DateTime.UtcNow;
            // создаем JWT-токен
            var jwt = new JwtSecurityToken(
                    issuer: AuthOptions.ISSUER,
                    audience: AuthOptions.AUDIENCE,
                    notBefore: now,
                    claims: identity.Claims,
                    expires: now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                    signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));

            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            return encodedJwt;
        }

        private ClaimsIdentity GetIdentity(string email, string password)
        {
            var user = DB.Users.FirstOrDefault(u => u.Email == email && u.Password == password);
            if (user != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimsIdentity.DefaultNameClaimType, user.Email),
                    new Claim(ClaimsIdentity.DefaultIssuer, user.Id.ToString())
                };
                ClaimsIdentity claimsIdentity =
                new ClaimsIdentity(claims, "auth_token", ClaimsIdentity.DefaultNameClaimType,
                    ClaimsIdentity.DefaultRoleClaimType);
                return claimsIdentity;
            }

            // если пользователя не найдено
            return null;
        }
    }
}
