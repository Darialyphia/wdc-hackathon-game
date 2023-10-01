<script setup lang="ts">
const { isLoading } = useConvexAuth();

const isReady = ref(false);

const route = useRoute();

const bodyBg = useCssVar('--body-bg');
watchEffect(() => {
  bodyBg.value = route.meta.bg ? `url(${route.meta.bg})` : 'var(--surface-2)';
});

until(isLoading)
  .not.toBe(true)
  .then(() => {
    isReady.value = true;
  });
</script>
<template>
  <Suspense>
    <DynamicLayout>
      <main v-if="!isReady">
        <UiSpinner size="xl" />
      </main>

      <RouterView v-else v-slot="{ Component }">
        <template v-if="Component">
          <Suspense>
            <component :is="Component" />

            <template #fallback>
              <main class="container">Loading...</main>
            </template>
          </Suspense>
        </template>
      </RouterView>
    </DynamicLayout>
  </Suspense>

  <ConfirmGameModal />
  <SignupModal />
  <ServiceWorkerPrompt />
</template>

<style scoped>
:global(#app) {
  background: var(--body-bg);
  background-attachment: fixed;
  background-size: cover;
  transition: background-image 0.5s ease;
}

header {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  margin-bottom: var(--size-5);
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
}
</style>
