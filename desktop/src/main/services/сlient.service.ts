import { prisma } from "../db/prisma";
import { Client, ClientDetails, Role, ServiceResponse } from "../../api/types";

export const ClientService = {
  async getAll(): Promise<ServiceResponse<Client[]>> {
    try {
      const users = await prisma.users.findMany({
        where: { role: { in: [Role.Client, Role.Guest] } },
        include: {
          _count: { select: { appointments: true } },
          appointments: {
            orderBy: { start_time: "desc" },
            take: 1,
            select: { start_time: true },
          },
        },
        orderBy: { created_at: "desc" },
      });

      const data = users.map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        phone: u.phone ?? undefined,
        email: u.email ?? undefined,
        role: u.role,
        created_at: u.created_at.toISOString(),
        _count: u._count,
        last_appointment: u.appointments[0]?.start_time.toISOString() ?? null,
      }));

      return { success: true, data: JSON.parse(JSON.stringify(data)) };
    } catch (err: unknown) {
      console.error("ClientService GetAll Error:", err);
      return { success: false, error: (err as Error).message };
    }
  },
  async getById(id: string): Promise<ServiceResponse<ClientDetails>> {
    try {
      const user = await prisma.users.findUnique({
        where: { id },
        include: {
          _count: { select: { appointments: true } },
          appointments: {
            orderBy: { start_time: "desc" },
            include: {
              services: { select: { id: true, title: true, duration: true } },
              masters: {
                select: {
                  id: true,
                  users: { select: { first_name: true, last_name: true } },
                },
              },
            },
          },
        },
      });

      if (!user) return { success: false, error: "Клієнта не знайдено" };

      return { success: true, data: JSON.parse(JSON.stringify(user)) };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
