import prisma from "$lib/db.server";
import Result from "$lib/utils/result/result.util";

export async function load() {
  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      name: true,
    },
    take: 20,
  });
  return Result.Ok({ topics }).serialize();
}
