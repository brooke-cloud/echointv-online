// app/admin/(protected)/posts/actions.ts

"use server";
import { createUniquePostSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

const ADMIN_EMAILS = ["admin@echointv.com", "shihaoy74@gmail.com"];

// 🔒 1. 统一管理员权限校验
async function verifyAdmin() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("未登录");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  const isEmailAdmin =
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  const isAdmin = user?.role === "ADMIN" || isEmailAdmin;

  if (!isAdmin) {
    throw new Error("无管理员权限");
  }

  return user;
}

// 🌟 2. 导出创建文章 Action（支持 company 保存）
export async function createPost(formData: FormData) {
  await verifyAdmin();

  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim();
  const company = (formData.get("company") as string)?.trim() || ""; // 🌟 接收 company
  const description = (formData.get("description") as string)?.trim() || "";
  const content = (formData.get("content") as string) || "";
  const category = (formData.get("category") as string)?.trim() || "Career";
  const readingTime = (formData.get("readingTime") as string)?.trim() || "5 min read";
  const date =
    (formData.get("date") as string)?.trim() ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (!title) {
    throw new Error("文章标题不能为空");
  }

  // 自动根据标题生成 Slug
  if (!slug) {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
    slug = generatedSlug || `post-${Date.now()}`;
  }

  let finalSlug = slug;
  const existingPost = await prisma.post.findUnique({
    where: { slug: finalSlug },
  });
  if (existingPost) {
    finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  // 写入数据库
  await prisma.post.create({
    data: {
      title,
      slug: finalSlug,
      company, // 🌟 写入目标大厂
      description,
      content,
      category,
      readingTime,
      date,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/posts");

  redirect("/admin/posts");
}

// 🌟 3. 导出更新文章 Action（支持 company 更新）
export async function updatePost(postId: number, formData: FormData) {
  await verifyAdmin();

  const title = (formData.get("title") as string)?.trim();
  const company = (formData.get("company") as string)?.trim(); // 🌟 接收 company
  const description = (formData.get("description") as string)?.trim() || "";
  const content = (formData.get("content") as string) || "";
  const category = (formData.get("category") as string)?.trim() || "Career";
  const readingTime = (formData.get("readingTime") as string)?.trim() || "5 min read";
  const date = (formData.get("date") as string)?.trim();

  if (!postId) {
    throw new Error("无效的文章 ID");
  }

  if (!title) {
    throw new Error("文章标题不能为空");
  }

  // 更新文章数据
  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      description,
      content,
      category,
      readingTime,
      ...(company !== undefined ? { company } : {}), // 🌟 更新目标大厂
      ...(date ? { date } : {}),
    },
  });

  const updatedPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  revalidatePath("/blog");
  if (updatedPost?.slug) {
    revalidatePath(`/blog/${updatedPost.slug}`);
  }
  revalidatePath("/");
  revalidatePath("/admin/posts");

  redirect("/admin/posts");
}

// 🌟 4. 导出删除文章 Action
export async function deletePost(postId: number) {
  await verifyAdmin();

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("文章不存在");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/posts");

  return { success: true };
}

// 预设面经列表（已包含对应大厂 company 标识）
const PRESET_POSTS = [
  {
    title: "Meta E4/E5 全流程技术面试复盘与系统设计通关指南",
    company: "Meta", // 🌟 预设公司
    category: "System Design",
    description: "深度复盘 Meta 现场面试考察点，涵盖高并发 Feed 流架构设计、Trade-offs 权衡及 Coding 白板沟通核心要点。",
    content: `## 一、Meta 面试流程拆解\nMeta 的 SDE 面试通常包含 2 轮 Coding、1 轮 System Design（针对 E4 及以上）和 1 轮 BQ（Behavioral Question）。\n\n### 1. Coding 考核核心\nMeta 非常看重代码的**速度与无 Bug 产出**。通常 45 分钟需要完整写出 2 道题的最优解。\n\n### 2. 系统设计（System Design）黄金 4 步法\n- **Step 1 需求澄清（Scope the Problem）**：确认 DAU、读写比例、SLA 延迟要求。\n- **Step 2 高层架构（High-level Design）**：API 设计、网关、分布式缓存与数据库选型。\n- **Step 3 核心组件深挖（Deep Dive）**：数据分片（Sharding）、缓存一致性与容灾。\n- **Step 4 瓶颈与权衡（Bottlenecks & Trade-offs）**：分析单点故障与网络分区。`,
    date: "Aug 20, 2026",
    readingTime: "8 min read",
  },
  {
    title: "Amazon SDE II 真实面试经验：14条领导力准则 (LP) 与 BQ 黄金 STAR 答题法",
    company: "Amazon", // 🌟 预设公司
    category: "Behavioral",
    description: "揭秘亚马逊最看重的 14 条 Leadership Principles 考核逻辑，结合真实案例教你如何用 STAR 原则量化回答。",
    content: `## 为什么 Amazon 极其看重 LP？\n在亚马逊面试中，LP（Leadership Principles）往往拥有一票否决权（Bar Raiser）。\n\n### 核心高频 LP 拆解：\n1. **Customer Obsession（顾客至尚）**：讲述你如何为了用户体验做出的关键技术决策。\n2. **Deliver Results（达成业绩）**：在紧迫的时间线下如何排定优先级并上线交付。\n3. **Dive Deep（深入探究）**：面对复杂的线上故障时，你是如何定位到最底层的 Root Cause 的。\n\n### STAR 结构公式：\n- **Situation（情境）**：背景与业务痛点\n- **Task（任务）**：你的明确职责\n- **Action（行动）**：你采取的具体技术方案（突出个人贡献，少用 We 多用 I）\n- **Result（结果）**：用数据量化收益（如延迟降低 40%，QPS 提升 3 倍）`,
    date: "Aug 22, 2026",
    readingTime: "6 min read",
  },
  {
    title: "Google L4 算法面试深度解析：图论、拓扑排序与动态规划最优解",
    company: "Google", // 🌟 预设公司
    category: "Algorithms",
    description: "整理 Google 真实面试变形题思路推导，从暴力穷举到剪枝优化的全思考过程演练。",
    content: `## Google 算法面试风格\nGoogle 的算法题极少考原题，多数为现实业务场景抽象出来的图论或复杂 DP 变形题。\n\n### 考察核心：\n1. **主动沟通与提问**：先确认输入边界、数据规模与极端用例。\n2. **复杂度推导**：必须主动分析时间复杂度 O(V+E) 与空间占用。\n3. **代码健壮性**：严格处理空指针、溢出与循环依赖。`,
    date: "Aug 24, 2026",
    readingTime: "7 min read",
  },
  {
    title: "TikTok / 字节跳动国际化电商后端架构面经：高并发分布式锁与秒杀实战",
    company: "TikTok", // 🌟 预设公司
    category: "Architecture",
    description: "深度剖析亿级流量场景下的库存扣减、Redis 分布式锁、防超卖与消息队列削峰填谷设计。",
    content: `## 核心业务场景：秒杀防超卖\n在高并发电商大促场景下，如何保证高性能与数据最终一致性？\n\n### 架构方案要点：\n- **多级缓存**：本地缓存（Caffeine）+ 分布式缓存（Redis 集群）。\n- **Lua 脚本原子扣减**：利用 Redis Lua 脚本实现原子性库存校验与扣减。\n- **RocketMQ / Kafka 异步落库**：通过消息队列削峰，将订单持久化操作异步化。`,
    date: "Aug 25, 2026",
    readingTime: "10 min read",
  },
  {
    title: "北美科技大厂秋招求职全攻略：从简历精修、海投、OA 到 Onsite 谈薪 (Negotiation)",
    company: "Career", // 🌟 预设分类/公司
    category: "Career",
    description: "全流程梳理北美 CS 求职时间线，分享如何突破 ATS 简历筛选、斩获大厂面试并最大化争取 Sign-on 奖金与股票 Package。",
    content: `## 北美求职黄金时间线\n- **7-9月**：秋招黄金投递期，第一时间海投 + 大厂员工内部推荐（Referral）。\n- **9-11月**：OA 笔试与 Technical Phone Screen 技术电面。\n- **11-12月**：Virtual Onsite 终面与 Offer 沟通。\n\n### 谈薪谈判（Comp Negotiation）心法：\n拿到 Offer 后切忌立即接受，利用手里 Competing Offers 礼貌向 Recruiter 说明市场行情，通常能争取到更高的 Sign-on Bonus 或 RSU 股票授予！`,
    date: "Aug 26, 2026",
    readingTime: "9 min read",
  },
];

// 🌟 一键批量导入预设面经（同步导入 company 字段）
export async function importPresetPosts() {
  const session = await getCurrentUser();
  if (!session) throw new Error("未登录");

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const isEmailAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
  if (user?.role !== "ADMIN" && !isEmailAdmin) throw new Error("无管理员权限");

  let importedCount = 0;

  for (const item of PRESET_POSTS) {
    const existing = await prisma.post.findFirst({
      where: { title: item.title },
    });

    if (!existing) {
      const slug = await createUniquePostSlug(item.title);
      await prisma.post.create({
        data: {
          title: item.title,
          slug,
          company: item.company || "", // 🌟 写入预设目标大厂
          category: item.category,
          description: item.description,
          content: item.content,
          date: item.date,
          readingTime: item.readingTime,
        },
      });
      importedCount++;
    }
  }

  // 刷新全站前后台缓存
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");

  return { success: true, count: importedCount };
}