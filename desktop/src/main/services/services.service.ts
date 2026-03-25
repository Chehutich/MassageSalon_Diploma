import { prisma } from "../db/prisma";
import { Service, ServiceResponse } from "../../api/types";

export const ServicesService = {
  async getAll(): Promise<ServiceResponse<Service[]>> {
    try {
      const services = await prisma.services.findMany({
        include: {
          categories: true,
          master_services: true,
        },
        orderBy: [{ is_active: "desc" }, { title: "asc" }],
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
  async updateService(
    id: string,
    data: Partial<Service> & { masterIds?: string[] },
  ): Promise<ServiceResponse<void>> {
    try {
      const {
        title,
        description,
        duration,
        price,
        is_active,
        slug,
        badge,
        benefits,
        category_id,
        masterIds,
      } = data;

      const updateData: any = {
        title,
        description,
        duration,
        price: price ? price.toString() : undefined,
        is_active,
        slug,
        badge,
        benefits,
        category_id,
      };

      if (masterIds) {
        updateData.master_services = {
          deleteMany: {},
          create: masterIds.map((mId: string) => ({
            master_id: mId,
          })),
        };
      }

      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      await prisma.services.update({
        where: { id },
        data: updateData,
      });

      return { success: true };
    } catch (err: any) {
      console.error("Update Service Error:", err);
      return { success: false, error: err.message };
    }
  },
  async createService(
    data: Omit<Service, "id"> & { masterIds?: string[] },
  ): Promise<ServiceResponse<Service>> {
    try {
      const {
        title,
        description,
        duration,
        price,
        is_active,
        slug,
        badge,
        benefits,
        category_id,
        masterIds,
      } = data;

      const newService = await prisma.services.create({
        data: {
          title,
          description,
          duration,
          price: price.toString(),
          is_active: is_active ?? true,
          slug,
          badge,
          benefits: benefits || [],
          category_id,
          master_services: masterIds
            ? {
                create: masterIds.map((mId) => ({
                  master_id: mId,
                })),
              }
            : undefined,
        },
        include: {
          categories: true,
          master_services: true,
        },
      });

      return {
        success: true,
        data: JSON.parse(JSON.stringify(newService)) as Service,
      };
    } catch (err: any) {
      console.error("Create Service Error:", err);
      return {
        success: false,
        error: err.message || "Не вдалося створити послугу",
      };
    }
  },
};
