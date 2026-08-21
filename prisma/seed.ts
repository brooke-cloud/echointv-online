import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { problems } from "../data/problems";
import { posts } from "../data/posts";
import {
  createUniqueProblemSlug,
} from "../lib/slug";


const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

// 初始化数据库测试数据
async function main() {
  console.log("Starting database seed...");

  // 删除旧 Problem 数据
  await prisma.problem.deleteMany();

  for (const problem of problems) {
    const slug =
      await createUniqueProblemSlug(
        problem.title
      );

    await prisma.problem.create({
      data: {
        ...problem,
        slug,
      },
    });
  }

  console.log(`${problems.length} problems inserted.`);

  // 删除旧 Blog 数据
  await prisma.post.deleteMany();

  // 导入 Blog 数据
  for (const post of posts) {
    await prisma.post.create({
      data: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        category: post.category,
        date: post.date,
        readingTime: post.readingTime,
      },
    });
  }

  console.log(`${posts.length} posts inserted.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });