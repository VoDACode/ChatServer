using ApiService.Helpers;
using ApiService.Models;
using ApiService.Models.Cache;
using ApiService.Options;
using ApiService.Services;
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
    [Route("confirm")]
    [ApiController]
    public class ConfirmEmailsController : ControllerBase
    {
        DBContext DB;
        IMemoryCache cache;
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        public ConfirmEmailsController(DBContext dBContext, IMemoryCache cache)
        {
            this.cache = cache;
            DB = dBContext;
        }

        [HttpGet("email/{lKey}")]
        public IActionResult ConfirmEmail(string lKey)
        {
            var uKey = HttpContext.Request.Cookies["confirm_key"];
            DB.Users.ToList();
            var confirm = DB.ConfirmEmails.FirstOrDefault(c => c.LinkKey == lKey && c.UserKey == uKey);
            if (confirm == null)
                return Redirect("https://chat.privatevoda.space:5000");

            HttpContext.Response.Cookies.Delete("confirm_key");
            // Confirm set email
            var email = HttpContext.Request.Cookies["confirm_set_email"];
            if (!string.IsNullOrWhiteSpace(email))
            {
                getUserFromDB.Email = email;
                DB.SaveChanges();
                HttpContext.Response.Cookies.Delete("confirm_set_email");
                return Redirect("https://chat.privatevoda.space:5000");
            }

            var token = CreateToken(confirm.User.Email, confirm.User.Password);
            if (token == null)
                return Redirect("https://chat.privatevoda.space:5000");
            HttpContext.Response.Cookies.Append("auth_token", token);

            return Redirect("https://chat.privatevoda.space:5000");
        }

        [HttpGet("event/{key}")]
        public IActionResult ConfirmEvent(string key, string email)
        {
            var confirmModel = new ConfirmEventModel();

            email = Encoding.UTF8.GetString(Convert.FromBase64String(email));

            if (!cache.TryGetValue(CacheHelper.CreateCacheKeyString(email, "PasswordRecovery"), out confirmModel))
                return BadRequest(new { text = "The key is not valid", isError = true });

            if(confirmModel.Key != key)
                return BadRequest(new { text = "Key not found", isError = true });

            if (confirmModel.IsActivated)
                return BadRequest(new { text = "This key is activated", isError = true });

            confirmModel.Key = "".RandomString(128);
            confirmModel.IsActivated = true;
            cache.Set(CacheHelper.CreateCacheKeyString(email, "PasswordRecovery"), confirmModel, TimeSpan.FromMinutes(30));

            return Ok(new
            {
                isError = false,
                key = confirmModel.Key,
                email = Convert.ToBase64String(Encoding.UTF8.GetBytes(email)),
                eventName = "PasswordRecovery",
                query = $"{key}?email={email}"
            });
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
