import { prisma } from "../db/prisma";
import { Master, ServiceResponse, User } from "../../api/types";

export const MasterService = {
  async getAll(): Promise<ServiceResponse<Master[]>> {
    try {
      const masters = await prisma.masters.findMany({
        include: {
          users: true,
          master_services: true,
        },
      });

      return {
        success: true,
        data: JSON.parse(JSON.stringify(masters)) as Master[],
      };
    } catch (err: any) {
      console.error("MasterService GetAll Error:", err);
      return { success: false, error: err.message };
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
    } catch (err: any) {
      console.error("MasterService Search Error:", err);
      return { success: false, error: err.message };
    }
  },
};
