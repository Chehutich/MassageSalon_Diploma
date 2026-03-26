import { prisma } from "../db/prisma";
import { Service, ServiceResponse } from "../../api/types";

interface ServiceUpdateInput {
  title?: string;
  description?: string | null;
  duration?: number;
  price?: string;
  is_active?: boolean;
  slug?: string;
  badge?: string | null;
  benefits?: string[];
  category_id?: string;
  master_services?: {
    deleteMany: Record<string, never>;
    create: { master_id: string }[];
  };
}

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
    } catch (err: unknown) {
      console.error("ServicesService GetAll Error:", err);
      return {
        success: false,
        error: (err as Error).message ?? "Не вдалося завантажити список послуг",
      };
    }
  },

  async updateService(
    id: string,
    data: Partial<Service> & { masterIds?: string[] },
  ): Promise<ServiceResponse<void>> {
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

    try {
      const updateData: ServiceUpdateInput = {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration }),
        ...(price !== undefined && { price: price.toString() }),
        ...(is_active !== undefined && { is_active }),
        ...(slug !== undefined && { slug }),
        ...(badge !== undefined && { badge }),
        ...(benefits !== undefined && { benefits }),
        ...(category_id !== undefined && { category_id }),
        ...(masterIds && {
          master_services: {
            deleteMany: {},
            create: masterIds.map((mId) => ({ master_id: mId })),
          },
        }),
      };

      await prisma.services.update({ where: { id }, data: updateData });

      return { success: true };
    } catch (err: unknown) {
      console.error("Update Service Error:", err);
      return { success: false, error: (err as Error).message };
    }
  },

  async createService(
    data: Omit<Service, "id"> & { masterIds?: string[] },
  ): Promise<ServiceResponse<Service>> {
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

    try {
      const newService = await prisma.services.create({
        data: {
          title,
          description: description ?? null,
          duration,
          price: price.toString(),
          is_active: is_active ?? true,
          slug,
          badge: badge ?? null,
          benefits: benefits ?? [],
          category_id,
          ...(masterIds && {
            master_services: {
              create: masterIds.map((mId) => ({ master_id: mId })),
            },
          }),
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
    } catch (err: unknown) {
      console.error("Create Service Error:", err);
      return {
        success: false,
        error: (err as Error).message ?? "Не вдалося створити послугу",
      };
    }
  },
};
