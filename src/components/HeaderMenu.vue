<script setup lang="ts">
import { api } from '../api';

const { loginWithRedirect, logout } = useAuth0();

const { isAuthenticated, isLoading } = useConvexAuth();

const location = window.location;

const isReady = ref(false);
until(isLoading)
  .not.toBe(true)
  .then(() => {
    isReady.value = true;
  });

const me = await useSuspenseQuery(api.users.me, []);
</script>

<template>
  <template v-if="!isAuthenticated">
    <UiLinkButton @click="loginWithRedirect()">Log in</UiLinkButton>
    <RouterLink
      v-if="me"
      v-slot="{ navigate, href }"
      :to="{ name: 'Leaderboards' }"
      custom
    >
      <UiLinkButton :href="href" @click="navigate">Leaderboards</UiLinkButton>
    </RouterLink>
  </template>
  <template v-else>
    <RouterLink
      v-if="me"
      v-slot="{ navigate, href }"
      :to="{ name: 'Leaderboards' }"
      custom
    >
      <UiLinkButton :href="href" @click="navigate">Leaderboards</UiLinkButton>
    </RouterLink>
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
</template>
