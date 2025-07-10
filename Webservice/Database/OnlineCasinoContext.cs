using System;
using Microsoft.EntityFrameworkCore;

namespace onlinecasino.Database
{
    public class OnlineCasinoContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseSqlServer("Server=10.0.104.73;Database=bfs2023ik_kschelle;User Id=kschelle;Password=abc;Encrypt=True;TrustServerCertificate=True;");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("Users", schema: "Casino");
        }
    }
}
