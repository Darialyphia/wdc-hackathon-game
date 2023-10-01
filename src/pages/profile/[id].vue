<script setup lang="ts">
import { generalsLookup } from '../../sdk/generals';

definePage({
  name: 'Profile',
  meta: {
    bg: '/backgrounds/profile.jpg'
  }
});

const route = useRoute('Profile');
const dayjs = useDayjs();

const getGeneralIcon = (id: string) =>
  Object.values(generalsLookup).find(g => g.characterId === id)!.portraitUrl;

const { version } = useConfig();
</script>
<template>
  <main class="container" style="--container-size: var(--size-md)">
    <Query
      v-slot="{ data: user }"
      :query="api => api.users.getProfile"
      :args="{ userId: route.params.id }"
    >
      <section class="stats surface fancy-surface">
        <div class="flex flex-col gap-3">
          <div class="flex-1 grid place-content-center">
            <UiDonutChart :value="user.winrate" label="Win rate" />
          </div>
        </div>

        <dl class="flex flex-col justify-center">
          <h2 class="mb-5 text-center">{{ user.name }}</h2>
          <div>
            <dt>Elo</dt>
            <dd>{{ user.elo }}</dd>
          </div>
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

      <section class="grid gap-2">
        <h3 class="mb-2">Games history</h3>

        <article
          v-for="game in user.games"
          :key="game._id"
          class="surface fancy-surface"
          :class="game.isWinner ? 'is-win' : 'is-loss'"
        >
          <div class="game-players">
            <div>
              <img :src="getGeneralIcon(game.myGeneralId)" draggable="false" />
              <RouterLink :to="{ name: 'Profile', params: { id: user._id } }">
                {{ user.fullName }}
              </RouterLink>
            </div>
            VS
            <div>
              <img :src="getGeneralIcon(game.opponentGeralId)" draggable="false" />
              <RouterLink :to="{ name: 'Profile', params: { id: game.opponent._id } }">
                {{ game.opponent.fullName }}
              </RouterLink>
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

            <ArkTooltip>
              <ArkTooltipTrigger>
                <RouterLink
                  v-slot="{ href, navigate }"
                  custom
                  :to="{ name: 'Replay', params: { id: game._id } }"
                >
                  <UiGhostButton
                    :href="game.version === version && href"
                    left-icon="ic:baseline-remove-red-eye"
                    :disabled="game.version === version"
                    @click="navigate"
                  >
                    Replay
                  </UiGhostButton>
                </RouterLink>
              </ArkTooltipTrigger>
              <ArkTooltipPositioner>
                <ArkTooltipContent v-if="game.version !== version" class="surface">
                  This game was played in a current version of the game and can't be
                  replayed
                </ArkTooltipContent>
              </ArkTooltipPositioner>
            </ArkTooltip>

            <ReplayShareButton :game-id="game._id" />
          </div>
        </article>
      </section>
    </Query>
  </main>
</template>

<style scoped lang="postcss">
main {
  margin-block-start: var(--size-5);
}
.stats {
  display: flex;
  gap: var(--size-10);
  margin-bottom: var(--size-5);
}

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
}

.result {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  font-weight: var(--font-weight-5);
  color: var(--color);
}

.game-players {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  text-align: center;

  > div {
    display: flex;
    flex-direction: column;
  }

  a {
    text-decoration: underline;
  }

  img {
    align-self: center;

    aspect-ratio: 1;
    width: var(--size-8);

    border: solid var(--border-size-1) var(--primary);

    image-rendering: pixelated;
  }
}

[data-scope='tooltip'][data-part='content'] {
  padding: var(--size-2);
  font-weight: var(--font-weight-4);
  border: solid 1px var(--border);
}
</style>
