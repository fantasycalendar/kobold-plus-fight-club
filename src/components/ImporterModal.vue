<template>
  <Modal v-model:show="modals.importer" title="Import Custom Monsters">
    <div class="my-3 sm:mt-0 w-full" v-show="step === 1">
      <label for="importer_source">Import from</label>

      <SelectInput
        v-model="importerSourceType"
        name="importer_source"
        id="importer_source"
        :options="Importer.types"
        :label="
          Importer.types.find((type) => type.key === importerSourceType)
            .label ?? 'Loading...'
        "
        class="mb-4"
      >
      </SelectInput>

      <div class="mb-4">
        <component
          :is="importerHtml"
          v-model="importerResourceLocator"
          @downloadExample="downloadExampleFile"
        ></component>
      </div>
      <div class="text-red-400 dark:text-red-600" v-show="importError.length">
        <i class="fa fa-exclamation-triangle"></i>
        <span v-text="importError"></span>
      </div>
    </div>

    <div class="my-3 sm:mt-0 w-full" v-show="step === 2">
      <AlertBox
        class="mb-3"
        v-if="importFailed"
        heading="An error occurred while importing"
        role="danger"
      >
        {{ importFailureReason }}
      </AlertBox>

      <div class="text-lg">New Sources</div>

      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-2 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle">
              <div
                class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5"
              >
                <table
                  class="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
                >
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        class="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none group whitespace-nowrap w-64"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none sm:table-cell group whitespace-nowrap w-32"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32"
                      >
                        Short Name
                      </th>
                      <th
                        scope="col"
                        class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32"
                      >
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800"
                  >
                    <tr
                      v-for="source in stagedSources"
                      class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600"
                    >
                      <td
                        class="whitespace-nowrap py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-200"
                        v-text="source.name"
                      ></td>
                      <td
                        class="whitespace-nowrap py-2 px-3 text-sm text-gray-500 dark:text-gray-300"
                        v-text="source.type"
                      ></td>
                      <td
                        class="whitespace-nowrap py-2 px-3 text-sm text-gray-500 dark:text-gray-300"
                        v-text="source.shortname"
                      ></td>
                      <td
                        class="whitespace-nowrap py-2 px-3 text-sm text-gray-500 dark:text-gray-300"
                        v-text="source.link"
                      ></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-lg mt-4">New Monsters (Preview)</div>

      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-2 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle">
              <div
                class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5"
              >
                <table
                  class="min-w-full divide-y divide-gray-300 dark:divide-gray-600"
                >
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        class="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none group whitespace-nowrap w-64"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none table-cell group whitespace-nowrap w-32"
                      >
                        Size
                      </th>
                      <th
                        scope="col"
                        class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none sm:table-cell group whitespace-nowrap w-32"
                      >
                        CR
                      </th>
                      <th
                        scope="col"
                        class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32"
                      >
                        Alignment
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-900"
                  >
                    <tr
                      v-for="monster in stagedMonsters.slice(0, 6)"
                      class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600"
                    >
                      <td
                        class="w-full max-w-0 py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 w-64 max-w-64 truncate"
                      >
                        <span class="truncate" v-text="monster.name"></span>
                        <dl class="font-normal">
                          <dt class="sr-only">Sources</dt>
                          <dd
                            class="mt-1 truncate text-gray-500 dark:text-gray-400"
                            v-text="monster.sources"
                          ></dd>
                          <dt class="sr-only sm:hidden">Type</dt>
                          <dd
                            class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden"
                            v-text="monster.type"
                          ></dd>
                        </dl>
                      </td>
                      <td
                        class="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 table-cell w-32 max-w-32 truncate"
                      >
                        <span class="truncate" v-text="monster.size"></span>
                        <dl class="font-normal">
                          <dt class="sr-only sm:hidden">CR</dt>
                          <dd
                            class="mt-1 truncate text-gray-500 dark:text-gray-400 sm:hidden"
                          >
                            CR <span v-text="monster.cr"></span>
                          </dd>
                          <dt class="sr-only sm:hidden">Alignment</dt>
                          <dd
                            class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden"
                            v-text="monster.alignment"
                          ></dd>
                        </dl>
                      </td>
                      <td
                        class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 sm:table-cell w-32"
                      >
                        <span v-text="monster.cr"></span>
                      </td>
                      <td
                        class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32"
                        v-text="monster.type"
                      ></td>
                      <td
                        class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32"
                        v-text="monster.alignment"
                      ></td>
                    </tr>

                    <tr
                      v-show="stagedMonsters.length > 6"
                      class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600"
                    >
                      <td
                        colspan="5"
                        class="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 table-cell text-center"
                      >
                        And
                        <span v-text="stagedMonsters.length - 6"></span> more.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <!--			Step 1 button			-->
      <button
        :disabled="!canImport"
        v-show="step === 1"
        class="button-primary-md"
        @click="startImport"
      >
        Preview Import
      </button>

      <div class="flex justify-end">
        <!--			Step 2 buttons			-->
        <button
          v-show="step === 2"
          class="button-danger-outline-md mr-2"
          @click="abortImport"
        >
          Nope, go back!
        </button>
        <button
          v-show="step === 2"
          class="button-primary-md"
          :disabled="!canImport"
          @click="finishImport"
        >
          Looks Good, Import Them!
        </button>
      </div>

      <!--			Always shown			-->
      <button @click="cancelImport" type="button" class="button-secondary-md">
        Cancel
      </button>
    </template>
  </Modal>
</template>

<script>
import Importer from "../js/importer.js";
import Modal from "./Modal.vue";
import AlertBox from "./AlertBox.vue";
import SelectInput from "./SelectInput.vue";
import { useMonsters } from "../stores/monsters";
import { useModals } from "../stores/modals";
import { useSources } from "../stores/sources";
import { shallowRef } from "vue";
import {useNotifications} from "../stores/notifications";

export default {
  name: "ImporterModal",
  components: { Modal, AlertBox, SelectInput },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const monsters = useMonsters();
    const sources = useSources();
    const modals = useModals();
    const importerHtml = shallowRef(Importer.loadersHtml("google-sheets"));

    return {
      monsters,
      sources,
      modals,
      importerHtml,
      Importer,
    };
  },

  data() {
    return {
      importerResourceLocator: "",
      importerSourceType: "google-sheets",
      step: 1,
      stagedMonsters: [],
      stagedSources: [],
      canImport: true,
      importError: "",
      importFailed: false,
      importFailureReason: "",
    };
  },

  created() {
    this.$watch("importerResourceLocator", (newValue) => {
      if (!newValue) {
        this.canImport = false;
        this.importError = "";

        return;
      }

      this.validate(newValue);
    });

    this.$watch("importerSourceType", this.loadImporter);
  },

  mounted() {
    this.loadImporter();
  },

  methods: {
    async validate(newValue) {
      [this.canImport, this.importError] = await Importer.canImport(
        newValue,
        this.importerSourceType
      );
    },
    loadImporter() {
      this.importerHtml = Importer.loadersHtml(this.importerSourceType);
      this.importerResourceLocator = null;
    },
    async startImport() {
      const importResults = await Importer.import({
        type: this.importerSourceType,
        resourceLocator: this.importerResourceLocator,
      });

      this.stagedMonsters = importResults.monsters;
      this.stagedSources = importResults.sources;

      this.step = 2;
    },
    finishImport() {
      const sourceImportResults = this.sources.import(this.stagedSources);
      if (!sourceImportResults.success) {
        this.importFailed = true;
        this.canImport = false;
        this.importFailureReason = sourceImportResults.message;
        return;
      }
      this.stagedSources = [];

      const monsterImportResults = this.monsters.import(this.stagedMonsters);
      if (!monsterImportResults.success) {
        this.importFailed = true;
        this.canImport = false;
        this.importFailureReason = monsterImportResults.message;
        return;
      }

      this.stagedMonsters = [];

      useNotifications().notify({
        title: "Import complete!",
        body: "Your new source(s) have been imported",
      });

      this.step = 1;
      this.modals.hide("importer");
    },
    abortImport() {
      this.loadImporter();
      this.stagedSources = [];
      this.stagedMonsters = [];
      this.step = 1;
      this.canImport = false;
      this.importError = "";
      this.importFailed = false;
      this.importFailureReason = "";
    },
    cancelImport() {
      this.modals.hide("importer");
      this.abortImport();
    },
    downloadExampleFile() {
      const example = Importer.exampleFiles[this.importerSourceType];
      if (!example) return;
      example();
    },
  },
};
</script>

<style scoped></style>
