using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace ApiService.Services
{
    public class MailService
    {
        public static Task SendAsyn(string to, string subject, string text)
        {
            return Task.Factory.StartNew(() => {
                using (SmtpClient client = Connect())
                using (MailMessage message = new MailMessage(Config.MailSender.Address, to, subject, text))
                    client.Send(message);
            }); 
        }
        public static void Send(string to, string subject, string text)
        {
            using (SmtpClient client = Connect())
                using (MailMessage message = new MailMessage(Config.MailSender.Address, to, subject, text))
                    client.Send(message);
        }

        private static SmtpClient Connect()
        {
            SmtpClient smtpClient = new SmtpClient();
            smtpClient.Host = Config.MailService;
            smtpClient.Port = Config.MailPort;
            smtpClient.EnableSsl = true;
            smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtpClient.UseDefaultCredentials = false;
            smtpClient.Credentials = new NetworkCredential(Config.MailSender.Address, Config.MailPassword);
            return smtpClient;
        }
    }
}
