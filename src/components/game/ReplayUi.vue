<script setup lang="ts">
const replayStep = ref(0);

const isPlaying = ref(false);
watch(isPlaying, newValue => {
  if (newValue) replayStep.value++;
});

const { game, state, selectedEntity, atbTimeline, surrender } = useGame();

const players = computed(() =>
  game.value.players.map(player => ({
    ...player,
    general: state.value.entities.find(
      e => e.kind === 'general' && e.owner === player.userId
    )
  }))
);
</script>

<template>
  <div class="player-1">
    <img :src="players[0].general?.blueprint.iconUrl" />
    <div class="player-name">{{ players[0].user.name }}</div>

    <div class="hp">
      <div class="i-game-icons:health-normal" />
      {{ players[0].general?.hp.toFixed() }}
    </div>
  </div>

  <div class="player-2">
    <img :src="players[1].general?.blueprint.iconUrl" />
    <div class="player-name">{{ players[1].user.name }}</div>

    <div class="hp">
      <div class="i-game-icons:health-normal" />
      {{ players[1].general?.hp.toFixed() }}
    </div>
  </div>

  <div class="timeline">
    <div>
      <div class="global-atb" :style="{ '--percent': state.globalAtb }" />
      Turn&nbsp;{{ state.turn }}
    </div>
    <button
      v-for="(entity, index) in atbTimeline"
      :key="index"
      style="appearance: none"
      @mouseenter="selectedEntity = entity"
      @mouseleave="selectedEntity = null"
    >
      <img :src="entity.blueprint.iconUrl" />
    </button>
  </div>

  <Transition>
    <div v-if="selectedEntity" class="selected-entity">
      <img :src="selectedEntity.blueprint.iconUrl" />
      {{ selectedEntity.blueprint.name }}
      <br />
      Hp: {{ selectedEntity.hp }} / {{ selectedEntity.blueprint.maxHp }}
      <br />
      Atk:
      <span
        class="stat"
        :class="{
          'is-buffed': selectedEntity.attack > selectedEntity.blueprint.attack,
          'is-debuffed': selectedEntity.attack < selectedEntity.blueprint.attack
        }"
      >
        {{ selectedEntity.attack }}
      </span>
      <br />
      Def:
      <span
        class="stat"
        :class="{
          'is-buffed': selectedEntity.defense > selectedEntity.blueprint.defense,
          'is-debuffed': selectedEntity.defense < selectedEntity.blueprint.defense
        }"
      >
        {{ selectedEntity.defense }}
      </span>
      <br />
      Initiative:
      <span
        class="stat"
        :class="{
          'is-buffed': selectedEntity.initiative > selectedEntity.blueprint.initiative,
          'is-debuffed': selectedEntity.initiative < selectedEntity.blueprint.initiative
        }"
      >
        {{ selectedEntity.initiative }}
      </span>
      <br />
      AP: {{ selectedEntity.ap }} / {{ selectedEntity.maxAp }}
      <br />
      Skills
      <dl>
        <template v-for="skill in selectedEntity.blueprint.skills" :key="skill.id">
          <dt>
            {{ skill.name }}
          </dt>
          <dd>{{ skill.description }}</dd>
        </template>
      </dl>
      Passives
      <p v-if="!selectedEntity.triggers.length">No ongoing passives</p>
      <dl>
        <template v-for="trigger in selectedEntity.triggers" :key="trigger.name">
          <dt>
            {{ trigger.name }}
          </dt>
          <dd>{{ trigger.description }}</dd>
        </template>
      </dl>
      Auras
      <p v-if="!selectedEntity.auras.length">No ongoing aura</p>
      <dl>
        <template v-for="aura in selectedEntity.auras" :key="aura.id">
          <dt>
            {{ aura.name }}
          </dt>
          <dd>{{ aura.description }}</dd>
        </template>
      </dl>
    </div>
  </Transition>

  <div class="replay-controls" style="--ui-icon-size: var(--size-7)">
    <UiIconButton
      :icon="isPlaying ? 'material-symbols:stop' : 'material-symbols:play-arrow'"
      :title="isPlaying ? 'pause' : 'play'"
      @click="isPlaying = !isPlaying"
    />
    <UiIconButton
      :disabled="isPlaying"
      icon="ion:ios-fastforward"
      title="skip"
      @click="replayStep++"
    />
  </div>
</template>
