using ChatServer.Models;
using ChatServer.Models.View;
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

        [Route("/api/search")]
        public IActionResult SerachStorage(string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { errorText = "Parameter 'q' is empty!" });
            var result = (from u in DB.Users
                          where (!string.IsNullOrWhiteSpace(u.UserName) && u.UserName.Contains(q)) || u.Nickname.Contains(q)
                          select new SearchViewModel()
                          {
                              Id = u.Id,
                              Name = u.Nickname,
                              UniqueName = u.UserName,
                              ImgContent = u.ImgContent,
                              Type = SearchObjectType.Storage
                          }).ToList();
            result.AddRange((from s in DB.Storages
                      where !s.IsPrivate && (s.UniqueName.Contains(q) || s.Name.Contains(q))
                      select new SearchViewModel()
                      {
                          Id = s.Id,
                          Name = s.Name,
                          UniqueName = s.UniqueName,
                          ImgContent = s.ImgContent,
                          Type = SearchObjectType.User
                      }).ToList());
            result = result.OrderBy(p => p.UniqueName).Take(20).ToList();
            return Ok(result);
        }
    }
}
