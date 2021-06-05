using ApiService.Helpers;
using ApiService.Models;
using ApiService.Models.Cache;
using ApiService.Options;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
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
        IMemoryCache cache;
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }

        public AuthController(DBContext dBContext, IMemoryCache cache)
        {
            DB = dBContext;
            this.cache = cache;
        }

        [HttpPost("auth")]
        public IActionResult Authenticate(string email, string password)
        {
            var token = CreateToken(email, password);
            if (token == null)
                return BadRequest(new { errorText = "Invalid email or password." });

            return Ok(new { token = token });
        }

        [HttpPost("registration")]
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
            return Ok(User.Identity.IsAuthenticated);
        }

        [HttpPost("forgot")]
        public IActionResult ForgotPassword(string email)
        {
            if (!DB.Users.Any(p => p.Email == email))
                return BadRequest(new { text = "Email address not found.", isError = true });

            var confirmModel = new ConfirmEventModel();
            if(cache.TryGetValue(CacheHelper.CreateCacheKeyString(email, "PasswordRecovery"), out confirmModel))
            {
                return BadRequest(new
                {
                    text = "Email is sent.",
                    isError = true
                });
            }

            var key = "".RandomString(128);
            confirmModel = new ConfirmEventModel()
            {
                EventName = "PasswordRecovery",
                Key = key,
                User = DB.Users.First(p => p.Email == email),
                IsActivated = false
            };

            cache.CreateEntry(CacheHelper.CreateCacheKeyString(email, "PasswordRecovery"));
            cache.Set(CacheHelper.CreateCacheKeyString(email, "PasswordRecovery"), confirmModel, TimeSpan.FromSeconds(300));

            var base64Email = Convert.ToBase64String(Encoding.UTF8.GetBytes(email));

            MailService.SendAsyn(to: email,
                                subject: "Password recovery",
                                text: $"Please confirm your action.\nGo to this url:\n https://chat.privatevoda.space:5000/confirm/event/{key}?email={base64Email}");
            return Ok(new { isError = false });
        }

        [HttpPost("forgot/{key}/set")]
        public IActionResult SetForgotPassword(string password, string key, string email)
        {
            email = Encoding.UTF8.GetString(Convert.FromBase64String(email));
            var confirmModel = new ConfirmEventModel();

            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                return BadRequest(new { isError = true, text = "Password is too short" });

            if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(email) ||
                !cache.TryGetValue(CacheHelper.CreateCacheKeyString(email, "PasswordRecovery"), out confirmModel))
                return BadRequest(new { isError = true, text = "Unknown key" });

            if (!confirmModel.IsActivated)
                return BadRequest(new { isError = true, text = "Key not activated" });

            cache.Remove(CacheHelper.CreateCacheKeyString(email, "PasswordRecovery"));

            DB.Users.FirstOrDefault(p => p.Email == email).Password = password;
            DB.SaveChanges();

            return Ok(new { isError = false });
        }

        private string CreateToken(string email, string password)
        {
            var identity = GetIdentity(email, password);
            if (identity == null)
                return null;

            var now = DateTime.UtcNow;
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
            return null;
        }
    }
}
