<script setup lang="ts">
import { generals } from '../../sdk/generals';

definePage({
  name: 'Profile'
});

const route = useRoute('Profile');
const dayjs = useDayjs();

const getGeneralIcon = (id: string) =>
  Object.values(generals).find(g => g.characterId === id)!.iconUrl;
</script>
<template>
  <main class="container" style="--container-size: var(--size-md)">
    <Query
      v-slot="{ data: user }"
      :query="api => api.users.getProfile"
      :args="{ userId: route.params.id }"
    >
      <h2 class="mb-5 text-center">{{ user.name }}</h2>

      <section class="flex gap-10 mb-5 surface">
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
            <dd>{{ dayjs(user._creationTime).fromNow() }}</dd>
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
          <div class="game-players">
            <div>
              <img :src="getGeneralIcon(game.myGeneralId)" draggable="false" />
              {{ user.fullName }}
            </div>
            VS
            <div>
              <img :src="getGeneralIcon(game.opponentGeralId)" draggable="false" />
              {{ game.opponent.fullName }}
            </div>
          </div>
          <time :datetime="dayjs(game._creationTime).format('l')">
            {{ dayjs(game._creationTime).fromNow() }}
          </time>

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
              <UiGhostButton
                :href="href"
                left-icon="ic:baseline-remove-red-eye"
                @click="navigate"
              >
                Replay
              </UiGhostButton>
            </RouterLink>

            <ReplayShareButton :game-id="game._id" />
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

  padding: var(--size-2);

  border: solid var(--border-size-1) var(--border-dimmed);

  *:nth-child(2) {
    justify-self: center;
  }
  *:nth-child(3) {
    justify-self: flex-end;
  }

  &.is-win {
    background-color: hsl(var(--green-7-hsl) / 0.05);
  }

  &.is-loss {
    background-color: hsl(var(--red-7-hsl) / 0.05);
  }
}

.result {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  font-weight: var(--font-weight-5);
  color: var(--color);
}

.game-players {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  > div {
    display: flex;
    flex-direction: column;
  }
  img {
    align-self: center;
    aspect-ratio: 1;
    width: var(--size-9);
    image-rendering: pixelated;
  }
}
</style>
