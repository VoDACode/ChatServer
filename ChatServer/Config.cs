﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;

namespace ChatServer
{
    public class Config
    {
        public static MailAddress MailSender { get; } = new MailAddress("chat.server.by.voda@gmail.com", "Chat");
        public const string MailPassword = "wqacdutksijmglnj";
        public const string MailService = "smtp.gmail.com";
        public const int MailPort = 587;
    }
}