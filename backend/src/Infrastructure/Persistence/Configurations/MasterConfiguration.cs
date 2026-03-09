using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class MasterConfiguration : IEntityTypeConfiguration<Master>
{
    public void Configure(EntityTypeBuilder<Master> builder)
    {
        builder.HasKey(e => e.Id).HasName("masters_pkey");

        builder.ToTable("masters");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

        builder.Property(e => e.Bio).HasColumnName("bio");

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .HasColumnName("is_active");

        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("updated_at");

        builder.Property(e => e.UserId).HasColumnName("user_id");

        builder.HasOne(d => d.User).WithMany(p => p.Masters)
            .HasForeignKey(d => d.UserId)
            .HasConstraintName("masters_user_id_fkey");

        builder.HasMany(d => d.Services).WithMany(p => p.Masters)
            .UsingEntity<Dictionary<string, object>>(
                "MasterService",
                r => r.HasOne<Service>().WithMany()
                    .HasForeignKey("ServiceId")
                    .HasConstraintName("master_services_service_id_fkey"),
                l => l.HasOne<Master>().WithMany()
                    .HasForeignKey("MasterId")
                    .HasConstraintName("master_services_master_id_fkey"),
                j =>
                {
                    j.HasKey("MasterId", "ServiceId").HasName("master_services_pkey");
                    j.ToTable("master_services");
                    j.IndexerProperty<Guid>("MasterId").HasColumnName("master_id");
                    j.IndexerProperty<Guid>("ServiceId").HasColumnName("service_id");
                });
    }
}
