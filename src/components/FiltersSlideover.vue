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
	  <div
		  @click="showFilters = false"
		  class="absolute 2xl:hidden inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity 2xl:duration-0"
		  aria-hidden="true"
		  x-transition:enter="ease-in-out duration-200"
		  x-transition:enter-start="opacity-0 2xl:opacity-100"
		  x-transition:enter-end="opacity-100"
		  x-transition:leave="ease-in-out duration-200"
		  x-transition:leave-start="opacity-100"
		  x-transition:leave-end="opacity-0 2xl:opacity-100"
		  v-show="showFilters"
	  ></div>

	  <div
		  class="pointer-events-none fixed 2xl:static inset-y-0 right-0 flex max-w-full pl-10"
	  >
		<div
			class="pointer-events-auto w-screen max-w-md 2xl:!duration-[0ms] sm:duration-700"
			x-transition:enter="transform transition ease-in-out duration-200"
			x-transition:enter-start="translate-x-full"
			x-transition:enter-end="translate-x-0"
			x-transition:leave="transform transition ease-in-out duration-200"
			x-transition:leave-start="translate-x-0"
			x-transition:leave-end="translate-x-full"
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
					  @click="showFilters = false"
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
			<div class="flex h-full flex-col relative 2xl:absolute 2xl:inset-y-0 2xl:w-[24rem] 2xl:right-0 2xl:py-8 flex-1 px-4 py-6 sm:px-6 space-y-4 overflow-y-auto scrollbar">
			  Panel sidebar thingy
			</div>
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

			<!--                <div>-->
			<!--                  <div-->
			<!--                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"-->
			<!--                  >-->
			<!--                    Alignment-->
			<!--                  </div>-->

			<!--                  <div-->
			<!--                    class="grid grid-cols-[12px_12px_repeat(12,_minmax(0,_1fr))] divide divide-gray-200 dark:divide-gray-600 gap-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden p-2"-->
			<!--                    x-data="{-->
			<!--												lawful_good: 1,-->
			<!--												neutral_good: 2,-->
			<!--												chaotic_good: 4,-->
			<!--												lawful_neutral: 8,-->
			<!--												neutral: 16,-->
			<!--												chaotic_neutral: 32,-->
			<!--												lawful_evil: 64,-->
			<!--												neutral_evil: 128,-->
			<!--												chaotic_evil: 256,-->
			<!--												total: $persist(1023).as('alignment'),-->
			<!--												randomIconIndex: 0,-->
			<!--												icons: [-->
			<!--														'fa-solid fa-dumpster-fire',-->
			<!--														'fa-solid fa-poo-storm',-->
			<!--														'fa-solid fa-meteor',-->
			<!--														'fa-solid fa-arrows-split-up-and-left',-->
			<!--														'fa-solid fa-arrows-turn-to-dots',-->
			<!--														'fa-solid fa-candy-cane',-->
			<!--														'fa-solid fa-stroopwafel',-->
			<!--														'fa-solid fa-cake-candles',-->
			<!--														'fa-solid fa-bowling-ball',-->
			<!--														'fa-solid fa-bath',-->
			<!--														'fa-solid fa-bomb',-->
			<!--														'fa-solid fa-business-time',-->
			<!--														'fa-solid fa-dragon',-->
			<!--														'fa-solid fa-arrow-up-right-dots',-->
			<!--														'fa-solid fa-fire',-->
			<!--														'fa-solid fa-arrows-to-circle',-->
			<!--														'fa-solid fa-cloud-meatball',-->
			<!--														'fa-solid fa-arrows-down-to-people',-->
			<!--														'fa-solid fa-person-walking-arrow-loop-left',-->
			<!--														'fa-solid fa-person-walking-dashed-line-arrow-right',-->
			<!--													],-->
			<!--												init() {-->
			<!--													this.$watch('total', (total) => {-->
			<!--														let newIndex = Math.floor(Math.random() * this.icons.length);-->
			<!--														this.randomIconIndex = (newIndex === this.randomIconIndex) ? (newIndex + 1) % this.icons.length : newIndex;-->
			<!--														this.onFiltersChanged();-->
			<!--													});-->
			<!--													this.onFiltersChanged();-->
			<!--												},-->
			<!--												onFiltersChanged() {-->
			<!--&lt;!&ndash;													window.dispatchEvent(new CustomEvent('filters-changed', { detail: { name: 'alignment', value: this.total }}));&ndash;&gt;-->
			<!--												},-->
			<!--												get randomIcon() {-->
			<!--													return this.icons[this.randomIconIndex];-->
			<!--												},-->
			<!--												toggle(value) {-->
			<!--													this.total = ((this.total & value) > 0) ? ((this.total | value) ^ value) : (this.total | value);-->
			<!--												},-->
			<!--												classes(value) {-->
			<!--													return {-->
			<!--														'bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white': this.total & value,-->
			<!--														'bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border text-gray-700 dark:text-white': !(this.total & value),-->
			<!--														'cursor-pointer grid place-items-center text-center select-none text-white': true,-->
			<!--													};-->
			<!--												},-->
			<!--												reset(){-->
			<!--													this.total = 1023;-->
			<!--												}-->
			<!--											}"-->
			<!--                    @reset-filters.window="reset()"-->
			<!--                  >-->
			<!--                    <div-->
			<!--                      @click="toggle(lawful_good | neutral | chaotic_evil)"-->
			<!--                      :class="classes(lawful_good | neutral | chaotic_evil)"-->
			<!--                      class="col-span-2 rounded-tl-md dark:border-gray-600"-->
			<!--                    ></div>-->
			<!--                    <div-->
			<!--                      @click="-->
			<!--                        toggle(lawful_good | lawful_neutral | lawful_evil)-->
			<!--                      "-->
			<!--                      :class="-->
			<!--                        classes(lawful_good | lawful_neutral | lawful_evil)-->
			<!--                      "-->
			<!--                      class="col-span-4 h-8 rounded-t-md"-->
			<!--                    >-->
			<!--                      <i class="fa fa-gavel"></i>-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(neutral_good | neutral | neutral_evil)"-->
			<!--                      :class="classes(neutral_good | neutral | neutral_evil)"-->
			<!--                      class="col-span-4 h-8 rounded-t-md"-->
			<!--                    >-->
			<!--                      <i class="fa fa-scale-balanced"></i>-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="-->
			<!--                        toggle(chaotic_good | chaotic_neutral | chaotic_evil)-->
			<!--                      "-->
			<!--                      :class="-->
			<!--                        classes(chaotic_good | chaotic_neutral | chaotic_evil)-->
			<!--                      "-->
			<!--                      class="col-span-4 h-8 rounded-t-md"-->
			<!--                    >-->
			<!--                      <i :class="{ [randomIcon]: true }"></i>-->
			<!--                    </div>-->

			<!--                    <div-->
			<!--                      @click="toggle(lawful_good | neutral_good | chaotic_good)"-->
			<!--                      :class="-->
			<!--                        classes(lawful_good | neutral_good | chaotic_good)-->
			<!--                      "-->
			<!--                      class="col-span-2 w-8 rounded-l-md"-->
			<!--                    >-->
			<!--                      <i class="fa fa-dove"></i>-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(lawful_good)"-->
			<!--                      :class="classes(lawful_good)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Lawful Good"-->
			<!--                    >-->
			<!--                      LG-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(neutral_good)"-->
			<!--                      :class="classes(neutral_good)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Neutral Good"-->
			<!--                    >-->
			<!--                      NG-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(chaotic_good)"-->
			<!--                      :class="classes(chaotic_good)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Chaotic Good"-->
			<!--                    >-->
			<!--                      CG-->
			<!--                    </div>-->

			<!--                    <div-->
			<!--                      @click="-->
			<!--                        toggle(lawful_neutral | neutral | chaotic_neutral)-->
			<!--                      "-->
			<!--                      :class="-->
			<!--                        classes(lawful_neutral | neutral | chaotic_neutral)-->
			<!--                      "-->
			<!--                      class="col-span-2 w-8 rounded-l-md"-->
			<!--                    >-->
			<!--                      <i class="fa fa-face-meh"></i>-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(lawful_neutral)"-->
			<!--                      :class="classes(lawful_neutral)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Lawful Neutral"-->
			<!--                    >-->
			<!--                      LN-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(neutral)"-->
			<!--                      :class="classes(neutral)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Neutral"-->
			<!--                    >-->
			<!--                      N-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(chaotic_neutral)"-->
			<!--                      :class="classes(chaotic_neutral)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Chaotic Neutral"-->
			<!--                    >-->
			<!--                      CN-->
			<!--                    </div>-->

			<!--                    <div-->
			<!--                      @click="toggle(lawful_evil | neutral_evil | chaotic_evil)"-->
			<!--                      :class="-->
			<!--                        classes(lawful_evil | neutral_evil | chaotic_evil)-->
			<!--                      "-->
			<!--                      class="col-span-2 w-8 rounded-l-md"-->
			<!--                    >-->
			<!--                      <i class="fa fa-skull"></i>-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(lawful_evil)"-->
			<!--                      :class="classes(lawful_evil)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Lawful Evil"-->
			<!--                    >-->
			<!--                      LE-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(neutral_evil)"-->
			<!--                      :class="classes(neutral_evil)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Neutral Evil"-->
			<!--                    >-->
			<!--                      NE-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="toggle(chaotic_evil)"-->
			<!--                      :class="classes(chaotic_evil)"-->
			<!--                      class="col-span-4 h-12"-->
			<!--                      x-tippy="Chaotic Evil"-->
			<!--                    >-->
			<!--                      CE-->
			<!--                    </div>-->

			<!--                    <div-->
			<!--                      @click="toggle(lawful_evil | neutral | chaotic_good)"-->
			<!--                      :class="classes(lawful_evil | neutral | chaotic_good)"-->
			<!--                      class="col-span-2 rounded-bl-md"-->
			<!--                    ></div>-->
			<!--                    <div-->
			<!--                      @click="total = total === 1023 ? 0 : 1023"-->
			<!--                      :class="{-->
			<!--                        'bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-900':-->
			<!--                          (total & 1023) === 1023,-->
			<!--                        'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border':-->
			<!--                          (total & 1023) !== 1023,-->
			<!--                      }"-->
			<!--                      class="select-none text-gray-900 col-span-6 cursor-pointer grid place-items-center h-8 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:text-white"-->
			<!--                    >-->
			<!--                      Any-->
			<!--                    </div>-->
			<!--                    <div-->
			<!--                      @click="total = total ^ 512"-->
			<!--                      :class="{-->
			<!--                        'bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-900':-->
			<!--                          (total & 512) === 512,-->
			<!--                        'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border':-->
			<!--                          (total & 512) !== 512,-->
			<!--                      }"-->
			<!--                      class="select-none text-gray-900 rounded-br-md col-span-6 cursor-pointer grid place-items-center h-8 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:text-white"-->
			<!--                    >-->
			<!--                      Unaligned-->
			<!--                    </div>-->
			<!--                  </div>-->
			<!--                </div>-->

			<!--                &lt;!&ndash; Multi Select &ndash;&gt;-->
			<!--                <div>-->
			<!--                  <div-->
			<!--                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"-->
			<!--                  >-->
			<!--                    Size category-->
			<!--                  </div>-->

			<!--                  <div-->
			<!--                    @mousedown.stop-->
			<!--                    x-data="multiSelect($refs.sizes, 'size', [-->
			<!--												{value: 'any', label: 'Any Size' },-->
			<!--												{value: 'tiny', label: 'Tiny' },-->
			<!--												{value: 'small', label: 'Small' },-->
			<!--												{value: 'medium', label: 'Medium' },-->
			<!--												{value: 'large', label: 'Large' },-->
			<!--												{value: 'huge', label: 'Huge' },-->
			<!--												{value: 'gargantuan', label: 'Gargantuan' }-->
			<!--											])"-->
			<!--                    @reset-filters.window="reset()"-->
			<!--                  >-->
			<!--                    <select-->
			<!--                      x-ref="sizes"-->
			<!--                      :multiple="multiple"-->
			<!--                      class="inline-block mb-2 mr-2 mt-1 w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"-->
			<!--                    ></select>-->
			<!--                  </div>-->
			<!--                </div>-->

			<!--                <div>-->
			<!--                  <div-->
			<!--                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"-->
			<!--                  >-->
			<!--                    Creature type-->
			<!--                  </div>-->

			<!--                  <div-->
			<!--                    @mousedown.stop-->
			<!--                    x-data="multiSelect($refs.creature_type, 'type', [-->
			<!--												{ value: 'any', label: 'Any Type' },-->
			<!--												{ value: 'aberration', label: 'Aberration' },-->
			<!--												{ value: 'beast', label: 'Beast' },-->
			<!--												{ value: 'celestial', label: 'Celestial' },-->
			<!--												{ value: 'construct', label: 'Construct' },-->
			<!--												{ value: 'dragon', label: 'Dragon' },-->
			<!--												{ value: 'elemental', label: 'Elemental' },-->
			<!--												{ value: 'fey', label: 'Fey' },-->
			<!--												{ value: 'fiend', label: 'Fiend' },-->
			<!--												{ value: 'giant', label: 'Giant' },-->
			<!--												{ value: 'humanoid', label: 'Humanoid' },-->
			<!--												{ value: 'monstrosity', label: 'Monstrosity' },-->
			<!--												{ value: 'ooze', label: 'Ooze' },-->
			<!--												{ value: 'plant', label: 'Plant' },-->
			<!--												{ value: 'undead', label: 'Undead' },-->
			<!--											])"-->
			<!--                    @reset-filters.window="reset()"-->
			<!--                  >-->
			<!--                    <select-->
			<!--                      x-ref="creature_type"-->
			<!--                      multiple-->
			<!--                      class="inline-block mb-2 mr-2 mt-1 w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"-->
			<!--                    ></select>-->
			<!--                  </div>-->
			<!--                </div>-->

			<!--                <div>-->
			<!--                  <div-->
			<!--                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"-->
			<!--                  >-->
			<!--                    Native environment-->
			<!--                  </div>-->

			<!--                  <div-->
			<!--                    @mousedown.stop-->
			<!--                    x-data="multiSelect($refs.environment, 'environment', [])"-->
			<!--                    @reset-filters.window="reset()"-->
			<!--                    @set-environments.window="-->
			<!--                      options = $event.detail;-->
			<!--                      setUp();-->
			<!--                    "-->
			<!--                  >-->
			<!--                    <select-->
			<!--                      x-ref="environment"-->
			<!--                      multiple-->
			<!--                      class="inline-block mb-2 mr-2 mt-1 w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"-->
			<!--                    ></select>-->
			<!--                  </div>-->
			<!--                </div>-->

			<!--                <div>-->
			<!--                  <div-->
			<!--                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"-->
			<!--                  >-->
			<!--                    Legendary Status-->
			<!--                  </div>-->

			<!--                  <div-->
			<!--                    @mousedown.stop-->
			<!--                    x-data="multiSelect($refs.legendary, 'legendary', [-->
			<!--												{ value: 'any', label: 'Any Legendary'},-->
			<!--												{ value: 'ordinary', label: 'Ordinary'},-->
			<!--												{ value: 'legendary', label: 'Legendary'},-->
			<!--												{ value: 'legendary_lair', label: 'Legendary (in lair)'},-->
			<!--											])"-->
			<!--                    @reset-filters.window="reset()"-->
			<!--                  >-->
			<!--                    <select-->
			<!--                      x-ref="legendary"-->
			<!--                      multiple-->
			<!--                      class="inline-block mb-2 mr-2 mt-1 w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"-->
			<!--                    ></select>-->
			<!--                  </div>-->
			<!--                </div>-->
			<!--              </div>-->
		  </div>
		</div>
	  </div>
	</div>
  </div>
</template>

<script>
export default {
  data() {
	return {
	  showFilters: false
	}
  }
}
</script>

<style scoped>

</style>