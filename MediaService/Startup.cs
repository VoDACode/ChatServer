using ApiService.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MediaService
{
    public class Startup
    {
        readonly string MyAllowServers = "_myAllowSpecificOrigins";
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //DbConnection
            string connection = "Data Source=10.0.1.20;Initial Catalog=Chat_VoDA;User ID=ChatServer;Password=a86519v90fzQ1813";

            services.AddDbContext<DBContext>(options =>
                options.UseSqlServer(connection));

            services.AddRazorPages();
            services.AddCors(options => {
                options.AddPolicy(MyAllowServers, builder =>
                {
                    builder.WithOrigins("https://chat.privatevoda.space", "https://api.chat.privatevoda.space",
                                    "https://chat.privatevoda.space:5000", "https://api.chat.privatevoda.space:5200")
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .AllowAnyMethod();
                });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseCors(MyAllowServers);

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
