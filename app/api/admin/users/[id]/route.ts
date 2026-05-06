import { NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { deleteUserByAdmin, getUserById, updateUserByAdmin, updateUserPassword } from "@/lib/user-db";

type Params = {
  params: Promise<{ id: string }>;
};

function getId(id: string) {
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const userId = getId(id);
    if (!userId) return NextResponse.json({ error: "Некорректный id пользователя." }, { status: 400 });

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      accountRole?: "user" | "admin";
      role?: string;
      stack?: string;
      level?: string;
    };

    const existing = getUserById(userId);
    if (!existing) return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });

    if (admin.id === userId && body.accountRole === "user") {
      return NextResponse.json({ error: "Нельзя снять роль администратора с самого себя." }, { status: 400 });
    }

    updateUserByAdmin(userId, {
      name: body.name?.trim() || existing.name,
      email: body.email?.trim() || existing.email,
      accountRole: body.accountRole ? (body.accountRole === "admin" ? "admin" : "user") : existing.accountRole,
      role: body.role?.trim() ?? existing.role ?? "",
      stack: body.stack?.trim() ?? existing.stack ?? "",
      level: body.level?.trim() ?? existing.level ?? ""
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Доступ только для администратора." }, { status: 403 });
    return NextResponse.json({ error: "Не удалось обновить пользователя." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const userId = getId(id);
    if (!userId) return NextResponse.json({ error: "Некорректный id пользователя." }, { status: 400 });
    if (admin.id === userId) return NextResponse.json({ error: "Нельзя удалить самого себя." }, { status: 400 });

    deleteUserByAdmin(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Доступ только для администратора." }, { status: 403 });
    return NextResponse.json({ error: "Не удалось удалить пользователя." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = getId(id);
    if (!userId) return NextResponse.json({ error: "Некорректный id пользователя." }, { status: 400 });

    const body = (await request.json()) as { password?: string };
    if (!body.password || body.password.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не короче 6 символов." }, { status: 400 });
    }

    const { hash, salt } = hashPassword(body.password);
    updateUserPassword(userId, { passwordHash: hash, passwordSalt: salt });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Доступ только для администратора." }, { status: 403 });
    return NextResponse.json({ error: "Не удалось сменить пароль." }, { status: 500 });
  }
}
