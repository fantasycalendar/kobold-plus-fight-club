<template>
  <div class="col-span-6 grid gap-2"
       :class="{
        'grid-cols-[1fr_42px]': source.custom && !deleting,
        'grid-cols-[42px_1fr_42px]': source.custom && deleting
       }"
       v-click-away="deleting = false"
  >
    <button class="text-left text-sm max-w-full truncate"
      v-show="!deleting"
      @click="source.enabled =! source.enabled;"
      :title="source.name"
      :class="{
        'button-primary-outline-md': !source.enabled,
        'button-primary-md': source.enabled
      }">
      <i class="fa pr-1" :class="{
        'fa-toggle-on': source.enabled,
        'fa-toggle-off': !source.enabled
      }"></i>
      <span class="truncate" v-text="source.name"></span>
    </button>

    <button v-show="source.custom && !deleting" class="!px-0 w-[42px] justify-center button-danger-outline-md" @click="deleting = true">
      <i class="fa fa-trash"></i>
    </button>

    <button v-show="deleting" class="!px-0 w-[42px] justify-center button-danger-outline-md" @click="$emit('delete', source.name)">
      <i class="fa fa-check"></i>
    </button>

    <div v-show="deleting" class="border dark:border-gray-700 rounded-md inline-flex items-center px-4 py-2">
      <i class="fa fa-exclamation-triangle pr-1 text-orange-500 dark:text-orange-700"></i>
      Are you sure?
    </div>

    <button v-show="deleting" class="!px-0 w-[42px] justify-center button-primary-outline-md" @click="deleting = false">
      <i class="fa fa-times"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: "SourcesModalSource",
  props: {
    source: {
      type: Object
    },
  },
  data() {
    return {
      deleting: false,
    }
  }
}
</script>

<style scoped>

</style>