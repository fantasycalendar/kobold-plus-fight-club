<template>
  <button
    :disabled="!encounter.groups.length"
    class="grow text-center button-primary-md"
    @click="sendToImprovedInitiative"
  >
    <span class="inline-flex justify-center w-full">
      <img
        class="mr-2 fill-white"
        style="height: 20px"
        src="/images/improved-initiative-logo.svg"
        alt="II"
      />
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import * as helpers from "../js/helpers";
import { useEncounter } from "../stores/encounter";
import {useParty} from "../stores/party";

const encounter = useEncounter();
const party = useParty();

function sendToImprovedInitiative() {
  const data = {
    Combatants: [],
  };

  encounter.groups.forEach((group) => {
    const monster = group.monster;
    for (let i = 0; i < group.count; i++) {
      data.Combatants.push({
        Name: monster.name,
        HP: { Value: monster.hp },
        InitiativeModifier: monster.init,
        AC: { Value: monster.ac },
        Player: "npc",
      });
    }
  });

  party.saved.forEach((party, partyIndex) => {
    party.players
      .filter((player) => player.active)
      .forEach((player, playerIndex) => {
        data.Combatants.push({
          Id: helpers.slugify(`${party.name}-${player.name}`),
          Name: player.name,
          InitiativeModifier: player.initiativeMod,
          InitiativeAdvantage: player.initiativeAdvantage,
          HP: { Value: player.currentHp, Max: player.maxHp },
          Player: "player",
        });
      });
  });

  const form = document.createElement("form");
  form.style.display = "none";
  form.setAttribute("target", "_blank");
  form.setAttribute("method", "POST");
  form.setAttribute(
    "action",
    "https://improvedinitiative.app/launchencounter/"
  );

  Object.entries(data).forEach((entry) => {
    const [key, value] = entry;
    const textarea = document.createElement("input");
    textarea.setAttribute("type", "hidden");
    textarea.setAttribute("name", key);
    textarea.setAttribute("value", JSON.stringify(value));
    form.appendChild(textarea);
  });

  document.body.appendChild(form);
  form.submit();
}
</script>

<style scoped></style>
