import prisma from "$lib/db.server";
import { DATABASE_URL } from "$env/static/private";
export async function load() {
  console.log(decodeURIComponent(DATABASE_URL));
  const data = await prisma.topic.create({
    data: {
      name: "hsdvgsd",
      status: "ASKING_QUES",
    },
  });
  return structuredClone(data);
}
