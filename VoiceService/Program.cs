using System;
using System.Net;

namespace VoiceService
{
    class Program
    {
        static void Main(string[] args)
        {
            WsServer.Init(5050);

            WsServer.StartListen();

            Console.ReadLine();
        }
    }
}
