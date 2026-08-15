import "dotenv/config";

import { prisma } from "../lib/prisma";
import {
  createUniqueProblemSlug,
} from "../lib/slug";

// 给旧 Problem 补充 Slug
async function main() {
  const problems =
    await prisma.problem.findMany({
      where: {
        slug: undefined,
      },

      orderBy: {
        id: "asc",
      },
    });

  console.log(
    `Found ${problems.length} problems without slug.`
  );

  for (const problem of problems) {
    const slug =
      await createUniqueProblemSlug(
        problem.title
      );

    await prisma.problem.update({
      where: {
        id: problem.id,
      },

      data: {
        slug,
      },
    });

    console.log(
      `${problem.title} -> ${slug}`
    );
  }

  console.log(
    "Problem slug backfill completed."
  );
}

main()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });