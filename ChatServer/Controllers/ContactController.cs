using ChatServer.Models;
using ChatServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ChatServer.Controllers
{
    [Authorize]
    [Route("api/contact")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        UserModel getUserFromDB { get => DB.Users.FirstOrDefault(u => u.Email == User.Identity.Name); }
        DBContext DB;
        public ContactController(DBContext dBContext)
        {
            DB = dBContext;
        }

        [HttpPost("add")]
        public IActionResult AddUserToContactList(string uID)
        {
            if(getUserFromDB.Id.ToString() == uID)
                return BadRequest(new { errorText = "Incorrect user id." });

            var user = DB.Users.FirstOrDefault(p => p.Id.ToString() == uID);
            if (user == null)
                return BadRequest(new { errorText = "Incorrect user id." });

            DB.ContactLists.Add(new ContactListModel()
            {
                FirstUser = getUserFromDB,
                SecondUser = user
            });
            DB.SaveChanges();

            return Ok();
        }
    }
}
