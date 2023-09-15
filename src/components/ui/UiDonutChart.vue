<script setup lang="ts">
const { label, value } = defineProps<{
  value: number;
  label: string;
}>();

const tweenedValue = ref({ value: 0 });
gsap.to(tweenedValue.value, {
  duration: 2,
  ease: Power3.easeOut,
  delay: 0,

  value: value
});

const degrees = computed(() => `${(tweenedValue.value.value * 360) / 100}deg`);
</script>

<template>
  <div class="ui-donut-chart">
    <div class="surface">
      <div>{{ label }}</div>
      <span class="value">{{ tweenedValue.value.toFixed(2) }}%</span>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.ui-donut-chart {
  display: grid;
  place-content: center;

  width: fit-content;

  background: conic-gradient(
    var(--primary) 0deg,
    var(--primary) v-bind(degrees),
    transparent v-bind(degrees)
  );
  background-repeat: no-repeat;
  border: solid 1px var(--border-dimmed);
  border-radius: var(--radius-round);

  > div {
    display: grid;
    place-content: center;

    aspect-ratio: 1;
    width: var(--size-12);
    margin: var(--size-5);

    text-align: center;

    border: solid 1px var(--border-dimmed);
    border-radius: var(--radius-round);
  }
}

.value {
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-5);
}
</style>
