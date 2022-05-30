<template>
  <div
    class="fixed 2xl:static 2xl:pointer-events-none inset-0 z-50 2xl:z-0 overflow-hidden"
    aria-labelledby="slide-over-title"
    role="dialog"
    aria-modal="true"
    v-show="showFilters"
    v-cloak
  >
    <div class="absolute 2xl:static inset-0 overflow-hidden">
      <!-- Background overlay, show/hide based on slide-over state. -->
      <transition
        enter-active-class="ease-in-out duration-200"
        enter-from-class="opacity-0 2xl:opacity-100"
        enter-to-class="opacity-100"
        leave-active-class="ease-in-out duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 2xl:opacity-100"
      >
        <div
          @click="$emit('close')"
          class="absolute 2xl:hidden inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity 2xl:duration-0"
          aria-hidden="true"
          v-show="showFilters"
        ></div>
      </transition>

      <div
        class="pointer-events-none fixed 2xl:static inset-y-0 right-0 flex max-w-full pl-10"
      >
        <transition
          enter-active-class="transform transition ease-in-out duration-200"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transform transition ease-in-out duration-200"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            class="pointer-events-auto w-screen max-w-md 2xl:!duration-[0ms] sm:duration-700"
            v-show="showFilters"
          >
            <div
              class="relative 2xl:static flex max-h-screen h-full flex-col overflow-y-hidden bg-white dark:bg-gray-800 shadow-xl"
            >
              <div
                class="px-4 sm:px-6 border-b dark:border-gray-700 py-6 2xl:hidden"
              >
                <div class="flex items-start justify-between">
                  <h2
                    class="text-lg font-medium text-gray-900 dark:text-gray-200"
                    id="slide-over-title"
                  >
                    Filter monsters
                  </h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button
                      @click="$emit('close')"
                      type="button"
                      class="rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <span class="sr-only">Close panel</span>
                      <!-- Heroicon name: outline/x -->
                      <svg
                        class="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div
                class="flex h-full flex-col relative 2xl:absolute 2xl:inset-y-0 2xl:w-[24rem] 2xl:right-0 2xl:py-8 flex-1 px-4 py-6 sm:px-6 space-y-4 overflow-y-auto scrollbar"
              >
                <!--              <div-->
                <!--                class="flex h-full flex-col relative 2xl:absolute 2xl:inset-y-0 2xl:w-[24rem] 2xl:right-0 2xl:py-8 flex-1 px-4 py-6 sm:px-6 space-y-4 overflow-y-auto scrollbar"-->
                <!--              >-->
                <!--                <div class="flex">-->
                <!--                  <button-->
                <!--                    @click="showSourcesModal = true"-->
                <!--                    class="button-primary-md w-full"-->
                <!--                  >-->
                <!--                    <span class="w-full text-center">Manage sources</span>-->
                <!--                  </button>-->

                <!--                  <button-->
                <!--                    :disabled="!nonDefaultFiltersCount"-->
                <!--                    @click="$dispatch('reset-filters')"-->
                <!--                    class="w-full button-secondary-md disabled:opacity-70 disabled:bg-slate-200 disabled:hover:bg-slate-200 disabled:dark:bg-slate-700 disabled:dark:hover:bg-slate-700 disabled:hover:text-emerald-700 disabled:dark:hover:text-emerald-600 grid place-items-center text-center hidden 2xl:block ml-2"-->
                <!--                  >-->
                <!--                    <span class="inline-block w-full"-->
                <!--                      ><i class="fa fa-undo pr-1"></i> Reset Filters</span-->
                <!--                    >-->
                <!--                  </button>-->
                <!--                </div>-->

                <!--                <div x-data="{ minCr: 0, maxCr: 0 }">-->
                <!--                  <div-->
                <!--                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"-->
                <!--                  >-->
                <!--                    Challenge Rating-->
                <!--                  </div>-->

                <!--                  <div-->
                <!--                    class="relative px-6 pt-1 pb-2 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-md"-->
                <!--                    x-data="{-->
                <!--											crValues: [-->
                <!--														{ value: '0', label: '0' },-->
                <!--														{ value: '1/8', label: '1/8' },-->
                <!--														{ value: '1/4', label: '1/4' },-->
                <!--														{ value: '1/2', label: '1/2' },-->
                <!--														{ value: '1', label: '1' },-->
                <!--														{ value: '2', label: '2' },-->
                <!--														{ value: '3', label: '3' },-->
                <!--														{ value: '4', label: '4' },-->
                <!--														{ value: '5', label: '5' },-->
                <!--														{ value: '6', label: '6' },-->
                <!--														{ value: '7', label: '7' },-->
                <!--														{ value: '8', label: '8' },-->
                <!--														{ value: '9', label: '9' },-->
                <!--														{ value: '10', label: '10' },-->
                <!--														{ value: '11', label: '11' },-->
                <!--														{ value: '12', label: '12' },-->
                <!--														{ value: '13', label: '13' },-->
                <!--														{ value: '14', label: '14' },-->
                <!--														{ value: '15', label: '15' },-->
                <!--														{ value: '16', label: '16' },-->
                <!--														{ value: '17', label: '17' },-->
                <!--														{ value: '18', label: '18' },-->
                <!--														{ value: '19', label: '19' },-->
                <!--														{ value: '20', label: '20' },-->
                <!--														{ value: '21', label: '21' },-->
                <!--														{ value: '22', label: '22' },-->
                <!--														{ value: '23', label: '23' },-->
                <!--														{ value: '24', label: '24' },-->
                <!--														{ value: '25', label: '25' },-->
                <!--														{ value: '26', label: '26' },-->
                <!--														{ value: '27', label: '27' },-->
                <!--														{ value: '28', label: '28' },-->
                <!--														{ value: '29', label: '29' },-->
                <!--														{ value: '30', label: '30' }-->
                <!--													]-->
                <!--										}"-->
                <!--                  >-->
                <!--                    <div-->
                <!--                      x-ref="cr_slider"-->
                <!--                      class="my-4 mx-2"-->
                <!--                      x-data="multiSlider($el, 'challenge_rating', crValues, (lower, upper) => {-->
                <!--														minCr = lower;-->
                <!--														maxCr = upper;-->
                <!--													})"-->
                <!--                      @set-cr-slider.window="set($event)"-->
                <!--                      @reset-cr-slider.window="reset()"-->
                <!--                      @reset-filters.window="reset()"-->
                <!--                    ></div>-->

                <!--                    <div class="flex justify-between items-center">-->
                <!--                      <div class="grow">-->
                <!--                        <select-->
                <!--                          class="w-full border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full py-1.5 pl-2.5 pr-0 sm:text-sm disabled:text-gray-600 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"-->
                <!--                          x-ref="min_cr_select"-->
                <!--                          name="min_cr"-->
                <!--                          id="min_cr_select"-->
                <!--                          @filters-changed.window="$el.value = minCr.value"-->
                <!--                          @change="-->
                <!--                            $dispatch('set-cr-slider', [-->
                <!--                              {-->
                <!--                                value: $event.target.value,-->
                <!--                                label: $event.target.value,-->
                <!--                              },-->
                <!--                              maxCr,-->
                <!--                            ])-->
                <!--                          "-->
                <!--                        >-->
                <!--                          <div v-for="option in crValues">-->
                <!--                            <option-->
                <!--                              :value="option.value"-->
                <!--                              v-text="option.label"-->
                <!--                              :disabled="-->
                <!--                                parseInt(option.value) > parseInt(maxCr.value)-->
                <!--                              "-->
                <!--                            ></option>-->
                <!--                          </div>-->
                <!--                        </select>-->
                <!--                      </div>-->
                <!--                      <div-->
                <!--                        class="grow text-center text-gray-500 dark:text-gray-400 user-select-none"-->
                <!--                      >-->
                <!--                        &le; CR &le;-->
                <!--                      </div>-->
                <!--                      <div class="grow">-->
                <!--                        <select-->
                <!--                          class="w-full border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full py-1.5 pl-2.5 pr-0 sm:text-sm disabled:text-gray-600 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"-->
                <!--                          x-ref="max_cr_select"-->
                <!--                          name="max_cr"-->
                <!--                          id="max_cr_select"-->
                <!--                          @filters-changed.window="$el.value = maxCr.value"-->
                <!--                          @change="-->
                <!--                            $dispatch('set-cr-slider', [-->
                <!--                              minCr,-->
                <!--                              {-->
                <!--                                value: $event.target.value,-->
                <!--                                label: $event.target.value,-->
                <!--                              },-->
                <!--                            ])-->
                <!--                          "-->
                <!--                        >-->
                <!--                          <div v-for="option in crValues">-->
                <!--                            <option-->
                <!--                              :value="option.value"-->
                <!--                              v-text="option.label"-->
                <!--                              :disabled="-->
                <!--                                parseInt(option.value) < parseInt(minCr.value)-->
                <!--                              "-->
                <!--                            ></option>-->
                <!--                          </div>-->
                <!--                        </select>-->
                <!--                      </div>-->
                <!--                    </div>-->

                <!--                    <span-->
                <!--                      @click="$dispatch('reset-cr-slider')"-->
                <!--                      v-show="!(minCr.value == 0 && maxCr.value == 30)"-->
                <!--                      class="absolute top-1 right-1 text-center cursor-pointer"-->
                <!--                    >-->
                <!--                      <i-->
                <!--                        class="fa fa-undo text-sm h-6 w-6 text-gray-800 dark:text-gray-300"-->
                <!--                      ></i>-->
                <!--                    </span>-->
                <!--                  </div>-->
                <!--                </div>-->

                <AlignmentGrid></AlignmentGrid>

                <!-- Multi Select -->
                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Size category
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any size"
                    :options="[
                      { value: 'tiny', label: 'Tiny' },
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' },
                      { value: 'huge', label: 'Huge' },
                      { value: 'gargantuan', label: 'Gargantuan' },
                    ]"
                  ></Multiselect>
                </div>

                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Creature type
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any type"
                    :options="[
                      { value: 'aberration', label: 'Aberration' },
                      { value: 'beast', label: 'Beast' },
                      { value: 'celestial', label: 'Celestial' },
                      { value: 'construct', label: 'Construct' },
                      { value: 'dragon', label: 'Dragon' },
                      { value: 'elemental', label: 'Elemental' },
                      { value: 'fey', label: 'Fey' },
                      { value: 'fiend', label: 'Fiend' },
                      { value: 'giant', label: 'Giant' },
                      { value: 'humanoid', label: 'Humanoid' },
                      { value: 'monstrosity', label: 'Monstrosity' },
                      { value: 'ooze', label: 'Ooze' },
                      { value: 'plant', label: 'Plant' },
                      { value: 'undead', label: 'Undead' },
                    ]"
                  ></Multiselect>
                </div>

                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Native Environment
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any Environment"
                    :options="[]"
                  ></Multiselect>
                </div>

                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Legendary Status
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any Legendary"
                    :options="[
                      { value: 'ordinary', label: 'Ordinary' },
                      { value: 'legendary', label: 'Legendary' },
                      { value: 'legendary_lair', label: 'Legendary (in lair)' },
                    ]"
                  ></Multiselect>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";
import AlignmentGrid from "./AlignmentGrid.vue";

defineProps({
  showFilters: {
    type: Boolean,
    default: false,
  },
});
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
