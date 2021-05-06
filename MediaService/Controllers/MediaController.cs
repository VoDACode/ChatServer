using ApiService.Models;
using ApiService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MediaService.Controllers
{
    [Authorize]
    [ApiController]
    public class MediaController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        public MediaController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [AllowAnonymous]
        [HttpGet("image")]
        public IActionResult GetTitleImage(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return BadRequest(new { errorText = "Image isn't selected." });
            var result = DB.Images.FirstOrDefault(p => p.Key == key);
            if (result == null)
                return BadRequest(new { errorText = $"User isn't found." });

            byte[] imgBytes = Convert.FromBase64String(result.Image.Replace("data:image/jpg;base64,", ""));
            return File(imgBytes, "image/jpeg");
        }

        [HttpGet("files/{sID}/{mID}/{fileUrl}")]
        public IActionResult DownloadMedia(int sID, int mID, string fileUrl)
        {
            DB.Storages.ToList();
            var userInStorage = DB.UserInStorages.FirstOrDefault(p => p.User == getUserFromDB && p.Storage.Id == sID);
            if (userInStorage == null)
                return BadRequest(new { errorText = "Access denied." });
            var file = DB.Messages.FirstOrDefault(p => p.Storage == userInStorage.Storage && p.Id == mID &&
                                        p.FileUrl == fileUrl && p.Type == MessageType.File);
            if (file == null)
                return BadRequest(new { errorText = "Access denied." });
            return File(System.IO.File.OpenRead(file.FileSavePath), "application/octet-stream", Path.GetFileName(file.FileSavePath));
        }
    }
}
