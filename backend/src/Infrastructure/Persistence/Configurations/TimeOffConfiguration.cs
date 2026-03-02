using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class TimeOffConfiguration : IEntityTypeConfiguration<TimeOff>
{
    public void Configure(EntityTypeBuilder<TimeOff> builder)
    {
        builder.HasKey(e => e.Id).HasName("time_offs_pkey");

        builder.ToTable("time_offs");

        builder.HasIndex(e => new { e.MasterId, e.StartDate, e.EndDate }, "idx_time_offs_master");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

        builder.Property(e => e.EndDate).HasColumnName("end_date");
        builder.Property(e => e.MasterId).HasColumnName("master_id");
        builder.Property(e => e.Reason).HasColumnName("reason");
        builder.Property(e => e.StartDate).HasColumnName("start_date");

        builder.HasOne(d => d.Master).WithMany(p => p.TimeOffs)
            .HasForeignKey(d => d.MasterId)
            .HasConstraintName("time_offs_master_id_fkey");
    }
}
