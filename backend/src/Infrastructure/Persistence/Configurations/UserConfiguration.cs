using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(e => e.Id).HasName("users_pkey");

        builder.ToTable("users");

        builder.HasIndex(e => e.Email, "users_email_key").IsUnique();

        builder.HasIndex(e => e.Phone, "users_phone_key").IsUnique();

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(e => e.Email)
            .HasMaxLength(255)
            .HasColumnName("email");

        builder.Property(e => e.PhotoUrl)
            .HasMaxLength(500)
            .HasColumnName("photo_url");

        builder.Property(e => e.FirstName)
            .HasMaxLength(100)
            .HasColumnName("first_name");

        builder.Property(e => e.LastName)
            .HasMaxLength(100)
            .HasColumnName("last_name");

        builder.Property(e => e.PasswordHash)
            .HasMaxLength(512)
            .HasColumnName("password_hash");

        builder.Property(e => e.Phone)
            .HasMaxLength(20)
            .HasColumnName("phone");

        builder.Property(e => e.RefreshToken)
            .HasMaxLength(512)
            .HasColumnName("refresh_token");

        builder.Property(e => e.RefreshTokenExpiry).HasColumnName("refresh_token_expiry");

        builder.Property(e => e.Role)
            .HasMaxLength(50)
            .HasConversion<string>()
            .HasDefaultValue(Role.Guest)
            .HasColumnName("role");

        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("updated_at");
    }
}
