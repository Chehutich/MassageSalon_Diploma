import { prisma } from "../db/prisma";
import { Service, ServiceResponse } from "../../api/types";

export const ServicesService = {
  async getAll(): Promise<ServiceResponse<Service[]>> {
    try {
      const services = await prisma.services.findMany({
        where: { is_active: true },
        include: {
          master_services: true,
        },
      });

      return {
        success: true,
        data: JSON.parse(JSON.stringify(services)) as Service[],
      };
    } catch (err: any) {
      console.error("ServicesService GetAll Error:", err);
      return {
        success: false,
        error: err.message || "Не вдалося завантажити список послуг",
      };
    }
  },
};
