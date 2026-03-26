import { prisma } from "../db/prisma";
import {
  CreateMasterPayload,
  Master,
  ServiceResponse,
  UpdateMasterPayload,
  User,
} from "../../api/types";

interface PrismaError extends Error {
  code?: string;
}

export const MasterService = {
  async getAll(): Promise<ServiceResponse<Master[]>> {
    try {
      const masters = await prisma.masters.findMany({
        include: {
          users: true,
          master_services: true,
        },
        orderBy: [{ is_active: "desc" }, { users: { first_name: "asc" } }],
      });

      return {
        success: true,
        data: JSON.parse(JSON.stringify(masters)) as Master[],
      };
    } catch (err: unknown) {
      console.error("MasterService GetAll Error:", err);
      return { success: false, error: (err as Error).message };
    }
  },

  async createMaster(
    payload: CreateMasterPayload,
  ): Promise<ServiceResponse<Master>> {
    const { firstName, lastName, phone, email, bio, serviceIds } = payload;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone ?? null,
            email: email ?? null,
            role: "Master",
          },
        });

        return tx.masters.create({
          data: {
            user_id: user.id,
            bio: bio ?? null,
            master_services: {
              create: (serviceIds ?? []).map((sId: string) => ({
                service_id: sId,
              })),
            },
          },
          include: { users: true, master_services: true },
        });
      });

      return {
        success: true,
        data: JSON.parse(JSON.stringify(result)) as Master,
      };
    } catch (err: unknown) {
      console.error("MasterService Create Error:", err);
      if ((err as PrismaError).code === "P2002") {
        return {
          success: false,
          error: "Користувач з таким телефоном або email вже існує",
        };
      }
      return { success: false, error: (err as Error).message };
    }
  },

  async updateMaster(
    id: string,
    payload: UpdateMasterPayload,
  ): Promise<ServiceResponse<void>> {
    const { firstName, lastName, phone, email, bio, is_active, serviceIds } =
      payload;

    try {
      await prisma.$transaction(async (tx) => {
        const currentMaster = await tx.masters.findUnique({
          where: { id },
          select: { user_id: true },
        });

        if (!currentMaster) throw new Error("Майстра не знайдено");

        await tx.users.update({
          where: { id: currentMaster.user_id },
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone ?? null,
            email: email ?? null,
          },
        });

        await tx.masters.update({
          where: { id },
          data: {
            bio: bio ?? null,
            is_active,
            master_services: {
              deleteMany: {},
              create: (serviceIds ?? []).map((sId: string) => ({
                service_id: sId,
              })),
            },
          },
        });
      });

      return { success: true };
    } catch (err: unknown) {
      console.error("MasterService Update Error:", err);
      return { success: false, error: (err as Error).message };
    }
  },

  async searchClients(query: string): Promise<ServiceResponse<User[]>> {
    try {
      const users = await prisma.users.findMany({
        where: {
          OR: [
            { phone: { contains: query } },
            { first_name: { contains: query, mode: "insensitive" } },
            { last_name: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      });

      return {
        success: true,
        data: JSON.parse(JSON.stringify(users)) as User[],
      };
    } catch (err: unknown) {
      console.error("MasterService Search Error:", err);
      return { success: false, error: (err as Error).message };
    }
  },
};
