using System;
using Microsoft.EntityFrameworkCore;

namespace onlinecasino.Database
{
    // Der Datenbank-Kontext für die Anwendung – verwaltet die Verbindung zur Datenbank und die Tabellen (DbSets)
    public class OnlineCasinoContext : DbContext
    {
        // Diese Eigenschaft stellt die Tabelle 'Users' in der Datenbank dar
        public DbSet<User> Users { get; set; }

        // Hier wird konfiguriert, wie sich die Anwendung mit der Datenbank verbindet
        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            // Verbindungszeichenfolge für den SQL Server
            options.UseSqlServer("Server=10.0.104.73;Database=bfs2023ik_kschelle;User Id=kschelle;Password=abc;Encrypt=True;TrustServerCertificate=True;");
        }

        // Konfiguration des Datenmodells (z. B. Tabellennamen, Schema etc.)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Die Entität 'User' wird der Tabelle "Users" im Schema "Casino" zugeordnet
            modelBuilder.Entity<User>().ToTable("Users", schema: "Casino");
        }
    }
}
