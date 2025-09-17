<script lang="ts">
  import Icon from "@iconify/svelte";
  import { linear } from "svelte/easing";
  import { writable, derived } from "svelte/store";
  import { type TransitionConfig } from "svelte/transition";
  import type { superForm } from "sveltekit-superforms";
  type Props = {
    questions: {
      id: unknown;
      title: string;
      options: {
        id: unknown;
        content: unknown;
      }[];
      answer: string | null;
    }[];
    topic_id: string;
    sf: ReturnType<
      typeof superForm<
        Record<string, string | number>,
        any,
        Record<string, string | number>
      >
    >;
  };
  const { questions, topic_id, sf }: Props = $props();
  let { form, enhance } = sf;
  let active_question_index = writable(0);
  let active_question = derived(active_question_index, ($i) => {
    return questions[$i].id;
  });
  let max_dis = writable(100);
  function back() {
    // $active_question_index == 0 ? 0 : $active_question_index - 1;
    active_question_index.update((value) => {
      if (value === 0) {
        return 0;
      } else {
        $max_dis = -100;
        return value - 1;
      }
    });
  }
  function next() {
    active_question_index.update((value) => {
      if (value === questions.length - 1) {
        return value;
      } else {
        $max_dis = 100;
        return value + 1;
      }
    });
  }
  type CardTransitionParams = {
    max_dis: number;
    duration: number;
    easing: (t: number) => number;
  };
  function card_transistion(
    node: HTMLDivElement,
    opt: CardTransitionParams
  ): TransitionConfig {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    return {
      delay: 0,
      duration: opt.duration,
      easing: opt.easing,
      css(t, u) {
        return `
        transform: ${transform} translateX(${-(t - 1) * opt.max_dis}%) scale(${t});
        opacity: ${t};
        `;
      },
    };
  }
</script>

<form
  class="d-card d-card-border h-full w-full px-2 py-2"
  method="POST"
  action="?/answer"
  use:enhance
>
  <div
    class="navigators d-card-title d-rounded-box p-2 flex justify-between items-center"
  >
    <h2 class="text-base-content opacity-60">
      {$active_question_index + 1}/{questions.length}
    </h2>
    <div class="d-card-actions flex justify-between gap-1 items-center">
      <button
        class="d-btn d-btn-ghost {$active_question_index === 0
          ? 'd-btn-disabled'
          : ''}"
        type="button"
        onclick={back}
      >
        <Icon icon="lucide:arrow-left" />
      </button>
      <button
        class="d-btn d-btn-soft {$active_question_index === questions.length - 1
          ? 'd-btn-disabled'
          : ''}"
        type="button"
        onclick={next}
      >
        <Icon icon="lucide:arrow-right" />
      </button>
    </div>
  </div>
  <div class="d-card-body relative overflow-x-hidden">
    {#each questions as question (question.id)}
      {#key $active_question}
        {#if $active_question === question.id}
          <div
            class="w-full absolute top-0 left-0 p-2 flex flex-col"
            in:card_transistion|global={{
              duration: 300,
              easing: linear,
              max_dis: $max_dis,
            }}
            out:card_transistion|global={{
              duration: 300,
              easing: linear,
              max_dis: -1 * $max_dis,
            }}
          >
            <h3 class="text-2xl">{question.title}</h3>
            {#if question.options.length > 0}
              <div class="suggestions">
                <p class="text-base-content my-2 relative left-2">
                  Suggestions:
                </p>
                <ul class="d-list gap-2">
                  {#each question.options as suggestion (suggestion.id)}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <li
                      class="d-rounded-box d-list-row cursor-pointer
                      {String($form[question.id as string]).toLowerCase() ===
                      String(suggestion.content).toLowerCase()
                        ? 'bg-neutral text-neutral-content'
                        : 'text-secondary hover:bg-base-200 hover:text-base-content'}"
                      onclick={() => {
                        $form[question.id as string] =
                          suggestion.content as string;
                      }}
                    >
                      {suggestion.content}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
            <div class="flex-grow my-2">
              <label for="textarea-${question.id}">
                <span class="text-base-content">Write your own answer:</span>
                <textarea
                  name={question.id as string}
                  bind:value={$form[question.id as string]}
                  id="textarea-${question.id}"
                  class="resize-none w-full h-full my-2 d-textarea"
                ></textarea>
              </label>
              <button
                type="button"
                class="d-btn d-btn-block my-2 d-btn-neutral {$active_question_index ===
                questions.length - 1
                  ? 'd-btn-disabled'
                  : ''}"
                onclick={next}
              >
                <span>Next</span>
                <Icon icon="lucide:arrow-right" class="text-lg" />
              </button>
              <button
                type="submit"
                class="d-btn d-btn-primary d-btn-block {$active_question_index ===
                questions.length - 1
                  ? 'block'
                  : 'hidden'}">Submit</button
              >
            </div>
          </div>
        {/if}
      {/key}
    {/each}
    <input type="text" value={topic_id} disabled hidden />
  </div>
</form>
