import { prisma } from "@/lib/prisma";
import { verifyPassword, setUserSession } from "@/lib/user-auth";
import { rateLimit } from "@/lib/rate-limit";

// 预设管理员邮箱列表
const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

export async function POST(request: Request) {
  try {
    // 🛡️ 请求限流防护（每 IP 每分钟最多尝试 10 次）
    const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
    const { success } = rateLimit(`login_${ip}`, 10, 60000);

    if (!success) {
      return Response.json(
        { error: "请求过于频繁，请 1 分钟后再试" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // 参数校验
    if (!email || !password) {
      return Response.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return Response.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 校验密码
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return Response.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 🌟 核心提权逻辑：若在管理员列表中且当前不是 ADMIN，则自动在数据库中升级为 ADMIN
    let currentRole = user.role;
    if (ADMIN_EMAILS.includes(normalizedEmail) && user.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      currentRole = "ADMIN";
    }

    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: currentRole,
    };

    // 写入 Session Cookie
    await setUserSession(userSession);

    return Response.json({
      success: true,
      user: userSession,
    });
  } catch (error) {
    console.error("登录接口异常:", error);
    return Response.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}