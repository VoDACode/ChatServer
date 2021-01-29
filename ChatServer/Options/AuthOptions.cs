using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ChatServer.Options
{
    public class AuthOptions
    {
        public const string ISSUER = "MyAuthServer"; // издатель токена
        public const string AUDIENCE = "MyAuthClient"; // потребитель токена
        const string KEY = "Wr5376BMs033sV01k19421zK3Q15EB87A80Wp0w570PO685aj4q577fb1qd878p8k84RMw1FJy041s719B98Bq0472c3l484jA87Ws40se7p4cZ64dp428h6d61C2K3AI915ke872rG99550KF9051vv1768V71803w52XzUU71H43oy7gk34d6MYA0u28N44RSY2Yk5O6923fq8uP917s7Kl86g6Q8tJ67Qev1510Oa8367lm724N5ecZR7c6XQ";   // ключ для шифрации
        public const int LIFETIME = 1; // время жизни токена - 1 минута
        public static SymmetricSecurityKey GetSymmetricSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.ASCII.GetBytes(KEY));
        }
    }
}
