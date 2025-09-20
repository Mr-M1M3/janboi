import prisma from "$lib/db.server.js";
import Result from "$lib/utils/result/result.util.js";
import { error, fail, isHttpError, isActionFailure } from "@sveltejs/kit";
import type { ErrorResponseData } from "$lib/types/ResponseData.type";
import { gen_lesson_q } from "./producers/gen-lesson.producer.js";
import rehypeFormat from 'rehype-format';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeMathjax from 'rehype-mathjax';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import { unified } from 'unified'

const processor = unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDefinitionList)
  .use(remarkExtendedTable)
  .use(remarkRehype, {
    allowDangerousHtml: true, handlers: {
      // any other handlers
      ...defListHastHandlers,
      ...extendedTableHandlers,

    }
  })
  .use(rehypeRaw)
  .use(rehypeFormat)
  .use(rehypeSanitize)
  .use(rehypeMathjax)
  .use(rehypeStringify)
export async function load({ params, depends, locals }) {
  depends("lesson-state");
  const { id: topic_id, lesson_id } = params;
  // querying with both lesson and topic id so that users cannot use one topic's lesson using another topic's id
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lesson_id,
      for_chapter: {
        for_outline: {
          topic: {
            id: topic_id,
            user: {
              id: locals.session?.user.id ?? "",
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return error(
      404,
      Result.Err({}).serialize(404, "not found") as ErrorResponseData<
        Record<never, never>
      >
    );
  }
  lesson.content = String(await processor.process(lesson.content || ""))
  return Result.Ok({ lesson }).serialize();
}

export const actions = {
  async generate({ params, locals }) {
    const { id: topic_id, lesson_id } = params;
    try {
      // querying with both lesson and topic id so that users cannot use one topic's lesson using another topic's id
      const lesson = await prisma.lesson.findUnique({
        where: {
          id: lesson_id,
          for_chapter: {
            for_outline: {
              topic: {
                id: topic_id,
                user: {
                  id: locals.session?.user.id ?? "",
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          content: true,
        },
      });
      if (!lesson) {
        return fail(400, Result.Err({}).serialize(400, "invalid data"));
      }
      if (lesson.status === "WAITING_FOR_APPROVAL") {
        await gen_lesson_q.add(
          lesson_id as string,
          {
            topic_id,
            lesson_id,
          },
          {
            attempts: 3,
            backoff: {
              type: "fixed",
              delay: 2,
            },
            removeOnComplete: true,
            removeOnFail: {
              age: 60 * 60 * 24 * 7,
            },
          }
        );
        const updated_lesson = await prisma.lesson.update({
          where: {
            id: lesson_id,
          },
          data: {
            status: "GENERATING",
          },
          select: {
            id: true,
            name: true,
            status: true,
            content: true,
          },
        });
        return Result.Ok({ lesson: updated_lesson }).serialize();
      } else {
        return Result.Ok({ lesson }).serialize();
      }
    } catch (err) {
      if (isHttpError(err)) {
        throw err;
      }
      if (isActionFailure(err)) {
        throw err;
      }
      // TODO: log the error
      return error(
        500,
        Result.Err({}).serialize(
          500,
          "internal server error"
        ) as ErrorResponseData<Record<never, never>>
      );
    }
  },
};
