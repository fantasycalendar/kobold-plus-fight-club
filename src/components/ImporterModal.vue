<template>
  <Modal v-model:show="show" title="Import Custom Monsters">
    <div class="my-3 sm:mt-0 w-full" v-show="step === 1">
      <label for="importer_source">Import from</label>
      <select v-model="importerSourceType" @change="loadImporter" name="importer_source" id="importer_source" class="mb-4 block w-full pl-3 pr-10 py-2 text-base focus:outline-none rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600">
        <optgroup label="More to come...">
          <option value="google-sheets">Google Sheets</option>
          <option value="json-raw">Raw JSON</option>
          <option value="json-file">JSON File</option>
          <option value="csv-file">CSV Files</option>
        </optgroup>
      </select>

      <div class="mb-4" v-html="importerHtml"></div>
      <div class="text-red-400 dark:text-red-600" v-show="importError.length">
        <i class="fa fa-exclamation-triangle"></i>
        <span v-text="importError"></span>
      </div>
    </div>

    <div class="my-3 sm:mt-0 w-full" v-show="step === 2">
      <div class="text-lg">New Sources</div>

      <div class="px-4 sm:px-6 lg:px-8">
        <div class="mt-2 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle">
              <div class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" class="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none group whitespace-nowrap w-64">Name</th>
                    <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none sm:table-cell group whitespace-nowrap w-32">Type</th>
                    <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32">Short Name</th>
                    <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32">Link</th>
                  </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    <tr v-for="source in stagedSources" class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600">
                      <td class="whitespace-nowrap py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-200" v-text="source.name"></td>
                      <td class="whitespace-nowrap py-2 px-3 text-sm text-gray-500 dark:text-gray-300" v-text="source.type"></td>
                      <td class="whitespace-nowrap py-2 px-3 text-sm text-gray-500 dark:text-gray-300" v-text="source.shortname"></td>
                      <td class="whitespace-nowrap py-2 px-3 text-sm text-gray-500 dark:text-gray-300" v-text="source.link"></td>
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
              <div class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" class="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none group whitespace-nowrap w-64">Name</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none table-cell group whitespace-nowrap w-32">Size</th>
                    <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none sm:table-cell group whitespace-nowrap w-32">CR</th>
                    <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32">Type</th>
                    <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none lg:table-cell group whitespace-nowrap w-32">Alignment</th>
                  </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-900">
                    <tr v-for="monster in stagedMonsters.slice(0, 6)" class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600">
                      <td class="w-full max-w-0 py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 w-64 max-w-64 truncate">
                        <span class="truncate" v-text="monster.name"></span>
                        <dl class="font-normal">
                          <dt class="sr-only">Sources</dt>
                          <dd class="mt-1 truncate text-gray-500 dark:text-gray-400" v-text="monster.sources"></dd>
                          <dt class="sr-only sm:hidden">Type</dt>
                          <dd class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden" v-text="monster.type"></dd>
                        </dl>
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 table-cell w-32 max-w-32 truncate">
                        <span class="truncate" v-text="monster.size"></span>
                        <dl class="font-normal">
                          <dt class="sr-only sm:hidden">CR</dt>
                          <dd class="mt-1 truncate text-gray-500 dark:text-gray-400 sm:hidden">CR <span v-text="monster.cr"></span></dd>
                          <dt class="sr-only sm:hidden">Alignment</dt>
                          <dd class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden" v-text="monster.alignment"></dd>
                        </dl>
                      </td>
                      <td class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 sm:table-cell w-32">
                        <span v-text="monster.cr"></span>
                      </td>
                      <td class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32" v-text="monster.type"></td>
                      <td class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32" v-text="monster.alignment"></td>
                    </tr>

                  <tr v-show="stagedMonsters.length > 6" class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-600">
                    <td colspan="5" class="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 table-cell text-center">
                      And <span v-text="stagedMonsters.length - 6"></span> more.
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
      <button :disabled="!canImport" v-show="step === 1" class="button-primary-md" @click="startImport">Preview Import</button>

      <div class="flex justify-end">
        <!--			Step 2 button			-->
        <button v-show="step === 2" class="button-danger-outline-md mr-2" @click="abortImport">Nope, go back!</button>
        <button v-show="step === 2" class="button-primary-md" @click="finishImport">Looks Good, Import Them!</button>
      </div>

      <!--			Always shown			-->
      <button @click="cancelImport" type="button" class="button-secondary-md">Cancel</button>
    </template>
  </Modal>
</template>

<script>
import Importer from '../js/importer.js';
import Modal from "./Modal.vue";

export default {
  name: "ImporterModal",
  components: {Modal},

  props: {
    show: {
      type: Boolean,
      default: false,
    }
  },

  data() {
    return {
      importerResourceLocator: '',
      importerSourceType: 'google-sheets',
      importerHtml: '',
      step: 1,
      stagedMonsters: [],
      stagedSources: [],
      canImport: false,
      importError: '',
    }
  },

  mounted(){
    this.loadImporter();
    this.$watch('importerResourceLocator', async value => [this.canImport, this.importError] = await Importer.canImport(value, this.importerSourceType));
  },

  methods: {
    loadImporter(){
      this.importerHtml = '';
      this.importerHtml = Importer.loadersHtml[this.importerSourceType]();
      this.importerResourceLocator = null;
    },
    async startImport() {
      const importResults = await Importer.import({
      type: this.importerSourceType,
      resourceLocator: this.importerResourceLocator
      });

      this.stagedMonsters = importResults.monsters;
      this.stagedSources = importResults.sources;

      this.step = 2;
    },
    finishImport() {
      // importedSources = importedSources.concat(this.stagedSources)
      // formatSources(this.stagedSources);
      this.stagedSources = [];

      // importedMonsters = importedMonsters.concat(this.stagedMonsters)
      // formatMonsters(this.stagedMonsters);
      this.stagedMonsters = [];

      dispatchEvent(new CustomEvent('notification', {detail: {title: 'Import complete!', body: 'Your new source(s) have been imported'}}));

      this.step = 1;
      this.show = false;
    },
    abortImport() {
      this.loadImporter();
      this.stagedSources = [];
      this.stagedMonsters = [];
      this.step = 1;
      this.canImport = false;
      this.importError = '';
    },
    cancelImport() {
      this.show = false;
      this.abortImport();
    },
    downloadExampleFile(){
      const example = Importer.exampleFiles[this.importerSourceType];
      if(!example) return;
      example();
    }
  }
}
</script>

<style scoped>

</style>