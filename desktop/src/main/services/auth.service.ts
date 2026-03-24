import { User } from "../../api/types";
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";

interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const AuthService = {
  async login(email: string, pass: string): Promise<LoginResponse> {
    try {
      const user = await prisma.users.findUnique({ where: { email } });

      if (!user) return { success: false, error: "Користувача не знайдено" };

      const isPasswordValid = await bcrypt.compare(
        pass,
        user.password_hash || "",
      );
      if (!isPasswordValid) return { success: false, error: "Невірний пароль" };

      if (user.role !== "Admin") {
        return { success: false, error: "Відмовлено у доступі: ви не адмін" };
      }

      return {
        success: true,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          email: user.email ?? undefined,
          phone: user.phone ?? undefined,
        },
      };
    } catch (err: any) {
      return { success: false, error: "Помилка бази даних" };
    }
  },
};
