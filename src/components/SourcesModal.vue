<script setup>
import Modal from "./Modal.vue";
import SourcesModalSource from "./SourcesModalSource.vue";
</script>

<template>
  <Modal title="Select your sources">
    <div class="mt-2 max-h-96 overflow-y-auto px-1 scrollbar scrollbar-dark">

      <div v-for="type of sourcesByType">
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

<script>
export default {
  name: "SourcesModal",
  components: { Modal, SourcesModalSource },
  mounted() {
    this.$watch('showModal', (value) => this.$emit('update:show', value));
    this.$watch('show', (value) => this.showModal = value);
  },
  props: {
    show: false,
  },
  data() {
    return {
      sources: {},
      showModal: false,
    }
  },
  computed: {
    sourcesByType() {
      const sources = Object.values(this.sources).reduce((acc, source) => {
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
      }, []);

      const order = ["Official", "Official Adventure", "Official Web Supplement", "Third-Party", "Community"]

      sources.sort((a, b) => {
        return order.indexOf(a.type) - order.indexOf(b.type);
      })

      return sources;
    }
  }
}
</script>

<style scoped>

</style>