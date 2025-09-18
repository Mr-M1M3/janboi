import prisma from "$lib/db.server";
import Result from "$lib/utils/result/result.util";

export async function load({ locals }) {
  const topics = await prisma.topic.findMany({
    where: {
      user: {
        id: locals.session?.user.id ?? "",
      },
    },
    select: {
      id: true,
      name: true,
    },
    take: 20,
    orderBy: {
      createdAt: "asc"
    }
  });
  const user = locals.session ? {
    name: locals.session?.user.name,
    image: locals.session?.user.image
  } : null;
  return Result.Ok({ topics, user }).serialize();
}
