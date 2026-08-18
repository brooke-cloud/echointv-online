import { prisma } from "@/lib/prisma";
import { verifyPassword, setUserSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return Response.json(
        { error: "账号或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { error: "账号或密码错误" },
        { status: 401 }
      );
    }

    // 设置登录 Cookie
    await setUserSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("登录接口异常:", error);
    return Response.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}