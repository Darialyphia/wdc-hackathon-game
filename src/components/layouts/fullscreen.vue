<script setup lang="ts">
const { isLoading } = useConvexAuth();

const isReady = ref(false);
until(isLoading)
  .not.toBe(true)
  .then(() => {
    isReady.value = true;
  });
</script>
<template>
  <div class="layout">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.layout {
  display: grid;
  height: 100vh;
}
</style>
