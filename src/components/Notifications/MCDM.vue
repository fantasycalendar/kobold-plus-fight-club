<template>
  <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
    <p class="mb-1">MCDM's <strong>Flee, Mortals!</strong> encounter generation and monsters are now supported in K+FC. This can be found in the settings above the encounter panel.</p>
    <p class="primary-link cursor-pointer"><a @click="dismiss()">Check it out now!</a></p>
  </div>
</template>

<script>
import { useModals } from "../../stores/modals.js";
import { useNotifications } from "../../stores/notifications.js";

export default {
  props: {
    id: Number
  },
  methods: {
    dismiss(){
      useModals().show('strategy');
      useNotifications().dismiss(this.id);
    }
  }
}

</script>
