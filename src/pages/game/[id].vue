<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../api';

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
    {{ data }}
  </Query>
</template>
