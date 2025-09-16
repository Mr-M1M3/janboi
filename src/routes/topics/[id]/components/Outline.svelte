<script lang="ts">
  import { page } from "$app/state";
  type Props = {
    outline: {
      chapters: {
        id: string;
        name: string;
        lessons: {
          id: string;
          name: string;
        }[];
      }[];
    };
  };
  const { outline }: Props = $props();
</script>

{#each outline.chapters as chapter, i (chapter.id)}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    tabindex={i}
    class="d-collapse d-collapse-arrow bg-base-100 border-base-300 border my-2"
  >
    <input type="checkbox" />
    <div class="d-collapse-title font-semibold">
      {chapter.name}
    </div>
    <div class="d-collapse-content text-sm">
      {#each chapter.lessons as lesson, l_i (lesson.id)}
        <a
          href="{page.url.pathname}/{lesson.name.replaceAll(' ', '-')}"
          class="d-btn d-btn-block d-btn-outline my-2"
        >
          {lesson.name}
        </a>
      {/each}
    </div>
  </div>
{/each}
