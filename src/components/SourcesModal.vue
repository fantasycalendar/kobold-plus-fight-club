<script setup>
import Modal from "./Modal.vue";
import SourcesModalSource from "./SourcesModalSource.vue";
import { defineEmits, onMounted, ref, watch, computed } from "vue";

const props = defineProps({
  show: false,
});

const emit = defineEmits(['update:show']);
const showModal = ref(false);


watch(showModal, value => emit('update:show', value));
watch(() => props.show, value => showModal.value = value);

const sources = ref({});

const sourcesByType = computed(() => {
  const order = ["Official", "Official Adventure", "Official Web Supplement", "Third-Party", "Community"]
  return Object.values(sources.value).reduce((acc, source) => {
    const container = acc.find(obj => obj.title === source.type);
    if(!container){
      acc.push({
        title: source.type,
        sources: [source]
      })
    }else{
      container.sources.push(source);
    }
    return acc;
  }, []).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
})
</script>

<template>
  <Modal v-model:show="showModal" title="Select your sources">
    <div class="mt-2 max-h-96 overflow-y-auto px-1 scrollbar scrollbar-dark">

      <div v-if="sourcesByType.length" v-for="type of sourcesByType">
        <div class="mb-4">
          <h4 class="text-gray-700 dark:text-gray-300 leading-6 mb-2" v-text="type.title"></h4>

          <div class="grid gap-2 grid-cols-6 md:grid-cols-12 w-full">
            <div v-for="source of type.sources">
              <SourcesModalSource :source="source" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <button @click="$emit('update:show', false)" type="button" class="button-primary-md">Done</button>
  </Modal>
</template>
