<script setup lang="ts">
definePage({
  name: 'Game'
});
const route = useRoute('Game');
</script>

<template>
  <Query
    v-slot="{ data }"
    :query="api => api.games.getById"
    :args="{ gameId: route.params.id }"
  >
    <pre>{{ data }}</pre>
  </Query>
</template>
