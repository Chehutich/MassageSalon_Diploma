import { prisma } from "../db/prisma";

export const getAnalytics = async (
  _: any,
  { from, to }: { from?: string; to?: string },
) => {
  try {
    const where = {
      ...(from && to
        ? {
            start_time: { gte: new Date(from), lte: new Date(to) },
          }
        : {}),
    };

    const appointments = await prisma.appointments.findMany({
      where,
      select: {
        id: true,
        start_time: true,
        status: true,
        actual_price: true,
        masters: {
          select: {
            id: true,
            users: { select: { first_name: true, last_name: true } },
          },
        },
        services: {
          select: {
            title: true,
            duration: true,
            categories: { select: { title: true } },
          },
        },
      },
      orderBy: { start_time: "asc" },
    });

    // ✅ Сериализуем все не-примитивные типы
    const serialized = appointments.map((a) => ({
      ...a,
      start_time: a.start_time.toISOString(), // Date → string
      actual_price: a.actual_price.toString(), // Decimal → string
    }));

    return { success: true, data: serialized };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};
