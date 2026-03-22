using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.HasKey(e => e.Id)
            .HasName("appointments_pkey");

        builder.ToTable("appointments");

        builder.HasIndex(e => e.ClientId, "idx_appointments_client");

        builder.HasIndex(e => new { e.MasterId, e.StartTime }, "idx_appointments_master_time");

        builder.HasIndex(e => e.Status, "idx_appointments_status");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .HasColumnName("id");

        builder.Property(e => e.ActualPrice)
            .HasPrecision(10, 2)
            .HasColumnName("actual_price");

        builder.Property(e => e.ClientId)
            .HasColumnName("client_id");

        builder.Property(e => e.ClientNotes)
            .HasColumnName("client_notes");

        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");

        builder.Property(e => e.EndTime)
            .HasColumnName("end_time");

        builder.Property(e => e.MasterId)
            .HasColumnName("master_id");

        builder.Property(e => e.ServiceId)
            .HasColumnName("service_id");

        builder.Property(e => e.StartTime)
            .HasColumnName("start_time");

        builder.Property(e => e.Status)
            .HasMaxLength(50)
            .HasConversion<string>()
            .HasDefaultValue(AppointmentStatus.Confirmed)
            .HasColumnName("status");

        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("updated_at");

        builder.HasOne(d => d.Client).WithMany(p => p.Appointments)
            .HasForeignKey(d => d.ClientId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("appointments_client_id_fkey");

        builder.HasOne(d => d.Master).WithMany(p => p.Appointments)
            .HasForeignKey(d => d.MasterId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("appointments_master_id_fkey");

        builder.HasOne(d => d.Service).WithMany(p => p.Appointments)
            .HasForeignKey(d => d.ServiceId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("appointments_service_id_fkey");
    }
}
