<script setup lang="ts">
definePage({
  name: 'Profile',
  meta: {
    needsAuth: true
  }
});
</script>
<template>
  <main class="container surface">
    <Query v-slot="{ data: me }" :query="api => api.users.me" :args="{}">
      <h2>{{ me?.fullName }}</h2>
      <pre>{{ me }}</pre>
    </Query>
  </main>
</template>
