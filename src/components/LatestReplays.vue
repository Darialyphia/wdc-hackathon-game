<script setup lang="ts">
import { generalsLookup } from '../sdk/generals';

const getGeneralIcon = (id: string) =>
  Object.values(generalsLookup).find(g => g.characterId === id)!.portraitUrl;

const dayjs = useDayjs();
const { version } = useConfig();
</script>

<template>
  <PaginatedQuery :query="api => api.games.latestGames" :num-items="10" :args="{}">
    <template #loading>
      <div />
    </template>

    <template #default="{ data: games }">
      <div class="grid gap-2">
        <Transition v-for="game in games" :key="game._id" appear>
          <article class="surface fancy-surface">
            <div class="game-players">
              <div>
                <img :src="getGeneralIcon(game.players[0].generalId)" draggable="false" />
                <RouterLink
                  :to="{ name: 'Profile', params: { id: game.players[0].user._id } }"
                >
                  {{ game.players[0].user.name }}
                </RouterLink>
              </div>
              VS
              <div>
                <img :src="getGeneralIcon(game.players[1].generalId)" draggable="false" />
                <RouterLink
                  :to="{ name: 'Profile', params: { id: game.players[1].user._id } }"
                >
                  {{ game.players[1].user.name }}
                </RouterLink>
              </div>
            </div>

            <time :datetime="dayjs(game._creationTime).format('l')">
              {{ dayjs(game._creationTime).fromNow() }}
            </time>

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
          </article>
        </Transition>
      </div>
    </template>
  </PaginatedQuery>
</template>

<style scoped lang="postcss">
article {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;

  padding: var(--size-2) var(--size-4);

  border: solid var(--border-size-1) var(--border-dimmed);

  *:nth-child(2) {
    justify-self: center;
  }
  *:nth-child(3) {
    justify-self: flex-end;
  }
}

.game-players {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--size-2);
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

.v-enter-active,
.v-leave-active {
  transition: all 0.5s;
}

.v-enter-from,
.v-leave-to {
  transform: translateY(calc(-1 * var(--size-3)));
  opacity: 0;
}
</style>
