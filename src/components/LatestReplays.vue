<script setup lang="ts">
import { generalsLookup } from '../sdk/generals';

const getGeneralIcon = (id: string) =>
  Object.values(generalsLookup).find(g => g.characterId === id)!.iconUrl;

const dayjs = useDayjs();
</script>

<template>
  <PaginatedQuery
    :query="api => api.games.latestGames"
    :num-items="10"
    :args="{}"
    v-slot="{ data: games }"
  >
    <div class="grid gap-2">
      <article v-for="game in games" :key="game._id" class="surface">
        <div class="game-players">
          <div>
            <img :src="getGeneralIcon(game.players[0].generalId)" draggable="false" />
            {{ game.players[0].user.name }}
          </div>
          VS
          <div>
            <img :src="getGeneralIcon(game.players[1].generalId)" draggable="false" />
            {{ game.players[1].user.name }}
          </div>
        </div>

        <time :datetime="dayjs(game._creationTime).format('l')">
          {{ dayjs(game._creationTime).fromNow() }}
        </time>

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
            Watch replay
          </UiGhostButton>
        </RouterLink>
      </article>
    </div>
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
  display: flex;
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
    width: var(--size-9);
    image-rendering: pixelated;
  }
}
</style>
