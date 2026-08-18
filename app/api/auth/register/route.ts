import { NextResponse } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, setUserSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 参数校验
    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "请输入有效的电子邮箱地址" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return Response.json(
        { error: "密码长度不能少于 6 位" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return Response.json(
        { error: "该邮箱已被注册，请直接登录" },
        { status: 400 }
      );
    }

    // 密码加密并创建用户
    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name ? name.trim() : email.split("@")[0],
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // 设置登录状态 Cookie
    await setUserSession(user);

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("注册接口异常:", error);
    return Response.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}