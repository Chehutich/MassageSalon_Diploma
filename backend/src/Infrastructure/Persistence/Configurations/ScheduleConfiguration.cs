using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        builder.HasKey(e => e.Id)
            .HasName("schedules_pkey");

        builder.ToTable("schedules");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

        builder.Property(e => e.DayOfWeek)
            .HasColumnName("day_of_week");

        builder.Property(e => e.EndTime)
            .HasColumnName("end_time");

        builder.Property(e => e.MasterId)
            .HasColumnName("master_id");

        builder.Property(e => e.StartTime)
            .HasColumnName("start_time");

        builder.HasOne(d => d.Master)
            .WithMany(p => p.Schedules)
            .HasForeignKey(d => d.MasterId)
            .HasConstraintName("schedules_master_id_fkey");
    }
}
