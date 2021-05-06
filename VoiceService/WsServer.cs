using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Sockets;
using System.Net;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.IO;
using System.Text.Json;
using VoiceService.Models;

namespace VoiceService
{
    public static class WsServer
    {
        private static int _port;
        public static int Port { get => _port; }

        private static TcpListener listener;
        private static Thread listenThread;
        private static Thread CheckRooms;

        private static List<RoomModel> rooms = new List<RoomModel>();
        private static bool status = false;

        public static bool IsStarted { get => status; }

        public static void Init(int port)
        {
            if (IsStarted)
                throw new Exception("Service is running!");
            _port = port;
            listener = new TcpListener(IPAddress.Any, Port);
            listenThread = new Thread(() => _startListen());

            CheckRooms = new Thread(() => _checkRooms());
        }

        public static void StartListen()
        {
            status = true;
            listenThread.Start();
            CheckRooms.Start();
        }

        public static void StopListen()
        {
            listener.Stop();
            status = false;       
        }

        private static void _checkRooms()
        {
            while (IsStarted)
            {
                Thread.Sleep(20000);
                foreach (var room in rooms)
                {
                    try
                    {
                        if (room.Clients.Count == 0)
                        {
                            room.Clients.Last().Close();
                            room.Clients.Remove(room.Clients.Last());
                            rooms.Remove(room);
                        }
                    }
                    catch { }
                }
            }
        }

        private static void _startListen()
        {
            listener.Start();
            while (IsStarted)
            {
                var client = listener.AcceptTcpClient();
                Task.Factory.StartNew(() =>
                {
                    var selectRoom = "";
                    var stream = client.GetStream();
                    byte[] bytes = new byte[client.Available];
                    stream.Read(bytes, 0, client.Available);
                    string s = Encoding.UTF8.GetString(bytes);
                    
                    if (!Regex.IsMatch(s, "^GET", RegexOptions.IgnoreCase))
                        return;

                    Dictionary<string, string> header = new Dictionary<string, string>();
                    var lines = s.Split(new char[] { '\n', '\r' }).ToList();
                    while (lines.Remove("")) ;
                    foreach(string line in lines)
                    {
                        char c = ':';
                        if (Regex.IsMatch(line, "^GET", RegexOptions.IgnoreCase))
                            c = ' ';
                        var tmp = line.Split(c);
                        header.Add(tmp[0], tmp[1]);
                    }

                    Console.WriteLine("=====Handshaking from client=====\n{0}", s);
                    var response = StatusOk(s);
                    stream.Write(response, 0, response.Length);

                    var room = rooms.FirstOrDefault(p => p.Id == header["GET"]);
                    if (room == null)
                    {
                        var newRoom = new RoomModel()
                        {
                            Clients = new List<TcpClient>() { client },
                            Id = string.IsNullOrWhiteSpace(header["GET"]) ? DateTime.Now.Ticks.ToString() : header["GET"]
                        };
                        rooms.Add(newRoom);
                        room = rooms.FirstOrDefault(p => p.Id == newRoom.Id);
                    }
                    else{
                        room.Clients.Add(client);
                    }
                    selectRoom = room.Id;

                    while (IsStarted)
                    {
                        try
                        {
                            var res = ReadStream(client);
                            if (res.Length == 0)
                                continue;
                            Console.WriteLine("Data retranslated");
                            sendToRoom(selectRoom, res);
                        }
                        catch(Exception ex)
                        {
                            Console.WriteLine(ex);
                            room.Clients.Remove(client);
                            client.Client.Close();
                            break;
                        }
                    }
                });
            }
        }

        private static void sendMessageAllRooms(byte[] data)
        {
            foreach(var room in rooms)
            {
                sendToRoom(room.Id, data);
            }
        }

        private static void sendToRoom(string roomId, byte[] data)
        {
            var room = rooms.FirstOrDefault(p => p.Id == roomId);
            foreach(var clien in room.Clients)
            {
                try
                {
                    clien.GetStream().Write(data, 0, data.Length);
                }
                catch
                {
                    room.Clients.Remove(clien);
                }
            }
        }

        private static string ReadLine(Stream stream)
        {
            var buffer = new List<byte>();
            while (true)
            {
                buffer.Add((byte)stream.ReadByte());
                var line = Encoding.ASCII.GetString(buffer.ToArray());
                if (line.EndsWith(Environment.NewLine))
                {
                    return line.Substring(0, line.Length - 2);
                }
            }
        }

        private static byte[] ReadStream(TcpClient client)
        {
            if (client.Available <= 0)
                return new byte[0];
            byte[] bytes = new byte[client.Available];
            client.GetStream().Read(bytes, 0, client.Available);
            return bytes;
        }

        private static byte[] StatusOk(string readData)
        {
            string swk = Regex.Match(readData, "Sec-WebSocket-Key: (.*)").Groups[1].Value.Trim();
            string swka = swk + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
            byte[] swkaSha1 = SHA1.Create().ComputeHash(Encoding.UTF8.GetBytes(swka));
            string swkaSha1Base64 = Convert.ToBase64String(swkaSha1);

            byte[] response = Encoding.UTF8.GetBytes(
                "HTTP/1.1 101 Switching Protocols\r\n" +
                "Connection: Upgrade\r\n" +
                "Upgrade: websocket\r\n" +
                "Sec-WebSocket-Accept: " + swkaSha1Base64 + "\r\n\r\n");
            return response;
        }
    }
}
