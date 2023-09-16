<script setup lang="ts">
definePage({
  name: 'Profile'
});

const route = useRoute('Profile');
const dayjs = useDayjs();
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
            <dd>{{ dayjs(user._creationTime).format('LT') }}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 class="mb-4">Games history</h3>

        <article
          v-for="game in user.games"
          :key="game._id"
          class="surface"
          :class="game.isWinner ? 'is-win' : 'is-loss'"
        >
          <time :datetime="dayjs(game._creationTime).format('l')">
            {{ dayjs(game._creationTime).fromNow() }}
          </time>

          <div>VS {{ game.opponent?.name }}</div>

          <div
            class="result"
            :style="{ '--color': game.isWinner ? 'var(--green-6)' : 'var(--red-7)' }"
          >
            {{ game.isWinner ? 'WIN' : 'LOSS' }}

            <RouterLink
              v-slot="{ href, navigate }"
              custom
              :to="{ name: 'Replay', params: { id: game._id } }"
            >
              <UiButton
                :href="href"
                left-icon="ic:baseline-remove-red-eye"
                @click="navigate"
              >
                Replay
              </UiButton>
            </RouterLink>
          </div>
        </article>
      </section>
    </Query>
  </main>
</template>

<style scoped lang="postcss">
article {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--size-4);
  align-items: center;
  justify-content: space-between;

  border: solid var(--border-size-1) var(--border-dimmed);
  border-radius: var(--radius-2);

  *:nth-child(2) {
    justify-self: center;
  }
  *:nth-child(3) {
    justify-self: flex-end;
  }

  & + article {
    margin-block-start: var(--size-3);
  }

  &.is-win {
    background-color: hsl(var(--green-7-hsl) / 0.15);
  }

  &.is-loss {
    background-color: hsl(var(--red-7-hsl) / 0.15);
  }
}

.result {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  font-weight: var(--font-weight-5);
  color: var(--color);
}
</style>
