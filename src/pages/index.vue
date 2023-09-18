<script setup lang="ts">
definePage({
  name: 'Home'
});
</script>

<template>
  <main>
    <section class="container surface">
      <h2>Games</h2>
      <GameList />
    </section>

    <section class="container surface">
      <h2>Latest finished games</h2>
      <LatestReplays />
    </section>
  </main>
</template>

<style scoped>
main {
  display: grid;
  gap: var(--size-6);
}

h2 {
  margin-block-end: var(--size-3);
  font-size: var(--font-size-5);
}

article {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  padding: var(--size-3);

  border: solid var(--border-size-1) var(--primary);

  h3 {
    font-size: var(--font-size-3);
  }
}
</style>
