<script setup lang="ts">
import { api } from '../../api';

const { loginWithRedirect, logout } = useAuth0();

const { isAuthenticated, isLoading } = useConvexAuth();

const location = window.location;

const isReady = ref(false);
until(isLoading)
  .not.toBe(true)
  .then(() => {
    isReady.value = true;
  });

const MenuContent = createReusableTemplate();
const isMenuOpened = ref(false);

const me = await useSuspenseQuery(api.users.me, []);
</script>
<template>
  <div class="layout">
    <header class="container lt-lg:p-inline-3">
      <MenuContent.define>
        <UiLinkButton v-if="!isAuthenticated" @click="loginWithRedirect()">
          Log in
        </UiLinkButton>
        <template v-else>
          <RouterLink
            v-if="me"
            v-slot="{ navigate, href }"
            :to="{ name: 'Profile', params: { id: me._id } }"
            custom
          >
            <UiLinkButton :href="href" @click="navigate">
              {{ me.fullName }}
            </UiLinkButton>
          </RouterLink>
          <UiLinkButton
            left-icon="material-symbols:logout"
            @click="logout({ logoutParams: { returnTo: location.origin } })"
          >
            Log out
          </UiLinkButton>
        </template>
        <DarkModeToggle />
      </MenuContent.define>
      <h1>
        <RouterLink :to="{ name: 'Home' }">Hackathon Winning App</RouterLink>
      </h1>

      <nav>
        <MenuContent.reuse />
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
        <MenuContent.reuse />
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
  display: flex;
  gap: var(--size-3);
  align-items: center;

  margin-bottom: var(--size-3);
  padding-block: var(--size-3);
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
