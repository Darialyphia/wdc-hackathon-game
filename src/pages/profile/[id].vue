<script setup lang="ts">
definePage({
  name: 'Profile'
});

const route = useRoute('Profile');

const dateFormatter = new Intl.DateTimeFormat('en-US');
</script>
<template>
  <main class="container surface" style="--container-size: var(--size-md)">
    <Query
      v-slot="{ data: user }"
      :query="api => api.users.getProfile"
      :args="{ userId: route.params.id }"
    >
      <h2 class="mb-5 text-center">{{ user.name }}</h2>

      <section class="flex gap-10 mb-5">
        <div class="flex flex-col gap-3">
          <div class="flex-1 grid place-content-center">
            <UiDonutChart :value="user.winrate" label="Win rate" />
          </div>
        </div>

        <dl class="flex flex-col justify-center">
          <div>
            <dt>Games played</dt>
            <dd>{{ user.games.length }}</dd>
          </div>
          <div v-if="user._creationTime">
            <dt>Member since</dt>
            <dd>{{ dateFormatter.format(new Date(user._creationTime)) }}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>Games history</h3>

        <article
          v-for="game in user.games"
          :key="game._id"
          class="surface"
          :class="game.isWinner ? 'is-win' : 'is-loss'"
        >
          <h4 class="font-400 text-1">VS {{ game.opponent?.name }}</h4>

          <div class="game-result">
            {{ game.isWinner ? 'WIN' : 'LOSS' }}
          </div>

          <UiButton>Replay</UiButton>
        </article>
      </section>
    </Query>
  </main>
</template>

<style scoped lang="postcss">
article {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  justify-content: space-between;

  border: solid var(--border-size-1) var(--primary);
  border-radius: var(--radius-2);

  &.is-win {
    background-color: hsl(var(--green-7-hsl) / 0.15);
  }

  &.is-loss {
    background-color: hsl(var(--red-7-hsl) / 0.15);
  }
}

.game-result {
  margin-inline-start: auto;
  font-weight: var(--font-weight-5);

  article.is-win & {
    color: var(--green-6);
  }

  article.is-loss & {
    color: var(--red-7);
  }
}
</style>
