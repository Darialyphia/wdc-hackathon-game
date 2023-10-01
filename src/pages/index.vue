<script setup lang="ts">
definePage({
  name: 'Home',
  meta: {
    bg: '/backgrounds/home.jpg'
  }
});
</script>

<template>
  <main>
    <section class="surface">
      <h2>Games</h2>
      <GameList />
    </section>

    <section class="surface">
      <h2>Latest games</h2>
      <LatestReplays />
    </section>
  </main>
</template>

<style scoped>
main {
  section {
    background-color: transparent;
  }
}

section {
  max-inline-size: var(--size-md);
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
