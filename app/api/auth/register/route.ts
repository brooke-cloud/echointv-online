import { prisma } from "@/lib/prisma";
import { hashPassword, setUserSession } from "@/lib/user-auth";

// 预设管理员邮箱列表（注册时自动分配 ADMIN 角色并拥有全部会员权限）
const ADMIN_EMAILS = [ "shihaoy74@gmail.com"];

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

    const normalizedEmail = email.toLowerCase().trim();

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return Response.json(
        { error: "该邮箱已被注册，请直接登录" },
        { status: 400 }
      );
    }

    // 判断是否为管理员账号：管理员自动设为 ADMIN，其余普通注册为 USER（非会员）
    const role = ADMIN_EMAILS.includes(normalizedEmail) ? "ADMIN" : "USER";

    // 密码加密并创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name ? name.trim() : normalizedEmail.split("@")[0],
        role,
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