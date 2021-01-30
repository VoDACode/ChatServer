using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ChatServer.Controllers
{
    [Authorize]
    [Route("api/storage")]
    [ApiController]
    public class StorageController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        public StorageController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [HttpGet("list")]
        public IActionResult GetList()
        {
            DB.Storages.ToList();
            var result = (from us in DB.UserInStorages
                          where us.User == getUserFromDB
                          select new
                          {
                              storage = new
                              {
                                  createDate = us.DateOfEntry,
                                  id = us.Storage.Id,
                                  isPrivate = us.Storage.IsPrivate,
                                  status = (us.Storage.Type != StorageType.Private) ?
                                            DB.UserInStorages.Where(s => s.Storage == us.Storage).Count().ToString()
                                            : "",
                                  imgContent = us.Storage.ImgContent,
                                  name = us.Storage.Name,
                                  type = us.Storage.Type,
                                  uniqueName = us.Storage.UniqueName
                              },
                              message = (from m in DB.Messages
                                         where m.Storage == us.Storage
                                         select new
                                         {
                                             sender = m.Sender,
                                             sendDate = m.SendDate,
                                             type = m.Type,
                                             id = m.Id,
                                             textContent = m.TextContent,
                                             imgContent = m.ImgContent,
                                             fileUrl = m.FileUrl
                                         }).ToList()
                          }).ToList();
            return Ok(result);
        }
    }
}
