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

      <div class="container">
        <h1>
          <RouterLink :to="{ name: 'Home' }">Baldur's Gate 3 but better</RouterLink>
        </h1>

        <nav>
          <HeaderMenu />
        </nav>
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
      </div>
    </header>

    <slot />
  </div>
</template>

<style scoped lang="postcss">
.layout {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}
header {
  position: sticky;
  top: 0;

  .container {
    display: flex;
    gap: var(--size-3);
    align-items: center;

    padding-top: var(--size-2);
    padding-bottom: var(--size-2);

    @screen sm {
      padding-top: var(--size-3);
      padding-bottom: var(--size-3);
    }
  }
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
