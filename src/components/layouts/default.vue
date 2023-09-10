<script setup lang="ts">
const { isLoading } = useConvexAuth();

const isReady = ref(false);
until(isLoading)
  .not.toBe(true)
  .then(() => {
    isReady.value = true;
  });

const isMenuOpened = ref(false);
</script>
<template>
  <div class="layout">
    <header class="lt-lg:p-inline-3">
      <CurrentGameBanner />

      <div class="container flex gap-3 items-center">
        <h1>
          <RouterLink :to="{ name: 'Home' }">Hackathon Winning App</RouterLink>
        </h1>

        <nav>
          <HeaderMenu />
        </nav>
      </div>

      <UiSimpleDrawer id="header-menu" v-model:is-opened="isMenuOpened" title="Menu">
        <template #trigger="triggerProps">
          <UiIconButton
            class="md:hidden ml-auto"
            v-bind="triggerProps"
            title="open menu"
            icon="octicon:three-bars"
            :theme="{ size: 'font-size-5' }"
          />
        </template>
        <HeaderMenu />
      </UiSimpleDrawer>
    </header>

    <slot />
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}
header {
  position: sticky;
  top: 0;
}

nav {
  display: flex;
  align-items: center;
  margin-left: auto;

  @screen lt-md {
    display: none;
  }
}
h1 {
  font-size: var(--font-size-4);

  img {
    image-rendering: pixelated;
  }
}
</style>
