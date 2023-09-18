<script setup lang="ts">
definePage({
  name: 'Leaderboards'
});
</script>

<template>
  <main class="container surface">
    <h2 class="mb-6">Leaderboards</h2>

    <p class="mb-4">Here are our top 50 fiercest warriors !</p>

    <Query :query="api => api.users.getLeaderboards" :args="{}" v-slot="{ data: users }">
      <article>
        <div>Name</div>
        <div>ELO</div>
      </article>
      <article v-for="(user, index) in users" :key="user._id" class="surface">
        <div class="flex gap-2 items-center">
          <div class="i-mdi-trophy trophy" :class="`place-${index}`" v-if="index < 3" />
          {{ user.name }}
        </div>
        <div>{{ user.elo }}</div>
        <RouterLink
          :to="{ name: 'Profile', params: { id: user._id } }"
          custom
          v-slot="{ navigate, href }"
        >
          <UiGhostButton :href="href" @click="navigate">See profile</UiGhostButton>
        </RouterLink>
      </article>
    </Query>
  </main>
</template>

<style scoped lang="postcss">
main {
  --container-size: var(--size-md);
}

article {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;

  padding: var(--size-3) var(--size-4);

  border: solid var(--border-size-1) var(--border-dimmed);

  &:nth-of-type(1) {
    padding-block: var(--size-2);
  }
  *:nth-child(2) {
    justify-self: center;
  }
  *:nth-child(3) {
    justify-self: flex-end;
  }
}

.trophy {
  &.place-0 {
    color: #f5e022;
  }
  &.place-1 {
    color: #d9feff;
  }
  &.place-2 {
    color: #db9723;
  }
}
</style>
