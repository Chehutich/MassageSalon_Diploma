using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.HasKey(e => e.Id)
            .HasName("services_pkey");

        builder.ToTable("services");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

        builder.Property(e => e.CategoryId)
            .HasColumnName("category_id");

        builder.Property(e => e.Description)
            .HasColumnName("description");

        builder.Property(e => e.Duration)
            .HasColumnName("duration");

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .HasColumnName("is_active");

        builder.Property(e => e.Price)
            .HasPrecision(10, 2)
            .HasColumnName("price");

        builder.Property(e => e.Slug)
            .HasMaxLength(50)
            .IsRequired()
            .HasColumnName("slug");

        builder.Property(e => e.Title)
            .HasMaxLength(200)
            .HasColumnName("title");

        builder.Property(e => e.Badge)
            .HasMaxLength(50)
            .HasConversion<string>()
            .HasColumnName("badge");

        builder.Property(e => e.Benefits)
            .HasDefaultValueSql("'{}'::text[]")
            .HasColumnName("benefits");

        builder.HasOne(d => d.Category)
            .WithMany(p => p.Services)
            .HasForeignKey(d => d.CategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("services_category_id_fkey");
    }
}
