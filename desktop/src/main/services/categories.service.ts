import { prisma } from "../db/prisma";
import { Category, ServiceResponse } from "../../api/types";

// Prisma возвращает categories с _count — расширяем тип
type CategoryWithCount = Category & {
  _count: { services: number };
};

export const CategoryService = {
  async getAll(): Promise<ServiceResponse<CategoryWithCount[]>> {
    try {
      const categories = await prisma.categories.findMany({
        include: {
          _count: { select: { services: true } },
        },
        orderBy: [{ is_active: "desc" }, { title: "asc" }],
      });
      return { success: true, data: JSON.parse(JSON.stringify(categories)) };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async createCategory(
    data: Omit<Category, "id">,
  ): Promise<ServiceResponse<Category>> {
    try {
      const category = await prisma.categories.create({ data });
      return { success: true, data: category };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async updateCategory(
    id: string,
    data: Partial<Omit<Category, "id">>,
  ): Promise<ServiceResponse<void>> {
    try {
      await prisma.categories.update({ where: { id }, data });
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
