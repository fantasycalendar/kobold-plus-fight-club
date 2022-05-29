<script setup>
import FiltersSlideover from "../components/FiltersSlideover.vue";
import ImporterModal from "../components/ImporterModal.vue";
import NotificationArea from "../components/NotificationArea.vue";
</script>

<script>
import Choices from 'choices.js';
import hotkeys from 'hotkeys-js';
import encounter from "../js/encounter.js";
import noUiSlider from "nouislider";
import * as helpers from "../js/helpers.js";
import CONST from "../js/constants.js";
import Monster from "../js/monster.js";
import tippy from 'tippy.js';

const internationalNumberFormat = new Intl.NumberFormat('en-US')

export default {
  components: { FiltersSlideover, ImporterModal, NotificationArea },

  data() {
	return {
	  theme: window.theme,
	  sourcesVersion: "2.1.0",
	  storedSourcesVersion: "2.0.0",

	  menu: false,
	  showFilters: false,
	  showSourcesModal: false,
	  showEncounterModal: false,
	  showPartyModal: false,
	  showKeyboardModal: false,
	  showImporterModal: false,

	  mobileEncounterTab: false,

	  searchKeyboardShortcut: navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl K',
	  filters: {},
	  searchPlaceholder: "",
	  nonDefaultFiltersCount: 0,

	  loadedSources: [],
	  loadedMonsters: [],
    tab: 'history',

	  encounterHistory: [],
	  savedEncounters: [],

	  loadedEncounterIndex: null,
	  loadedLastEncounter: false,
    sourcesByType: [],

	  savedParties: [],

	  sources: {},
	  enabledSources: [],

	  allMonsters: [],
	  filteredMonsters: [],
	  monsterLookupTable: {},

	  environments: {},

	  totalPages: 1,
	  currentPage: 1,
	  pagination: [],
	  monstersPerPage: 10,

	  encounterType: "random",
	  encounterTypeSelectOpen: false,
	  encounterTypes: Object.fromEntries(
		  Object.entries(CONST.ENCOUNTER_TYPES).map((entry) => {
			return [entry[0], { key: entry[0], label: entry[1].name }];
		  })
	  ),

	  difficultySelectOpen: false,
	  difficulty: "medium",
	  search: "",

	  encounter: encounter,

	  sortBy: "name",
	  sortByDesc: true,

	  timer: null,

	  keyboardHelp: [
		{ key: 'ctrl+f', description: 'Toggle the filters sidebar' },
		{ key: 'ctrl+/', description: 'Displays this help window' },
		{ key: 'ctrl+shift+\\', description: 'Toggles light/dark theme' },
		{ key: 'ctrl+]', description: 'Next monsters search page' },
		{ key: 'ctrl+k', description: 'Focus the search box' },
		{ key: 'ctrl+[', description: 'Previous monsters search page' },
		{ key: 'ctrl+g', description: 'Generate an encounter' },
		{ key: 'ctrl+s', description: 'Save the current encounter' },
		{ key: 'esc', description: 'Close any open dialogs' },
	  ],

	  party: {

		groups: [{ players: 4, level: 1, getsXP: true }],

		addPlayerGroup() {

		  const lastGroup = this.groups[this.groups.length - 1] ?? { players: 4, level: 1, getsXP: true }

		  this.groups.push({ ...lastGroup });
		},

		removePlayerGroup(index) {
		  this.groups.splice(index, 1);
		},

		get experience() {
		  const experience = this.groups.reduce(this.getGroupExperience, {});
		  return this.app.activePlayers.reduce(this.getGroupExperience, experience);
		},

		getGroupExperience(acc, group){
		  const groupExp = CONST.EXP[group.level];
		  return {
			easy: (acc?.easy ?? 0) + (groupExp.easy * (group?.players ?? 1)),
			medium: (acc?.medium ?? 0) + (groupExp.medium * (group?.players ?? 1)),
			hard: (acc?.hard ?? 0) + (groupExp.hard * (group?.players ?? 1)),
			deadly: (acc?.deadly ?? 0) + (groupExp.deadly * (group?.players ?? 1)),
			daily: (acc?.daily ?? 0) + (groupExp.daily * (group?.players ?? 1))
		  }
		},

	  },

	};
  },

  computed: {
	keyboardText() {
	  return navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl K';
	},
	totalPlayers() {
	  return this.groups.reduce((acc, group) => {
		return acc + parseInt(group.players)
	  }, 0) + this.app.activePlayers.length;
	},

	totalPlayersToGainXP(){
	  return this.groups.reduce((acc, group) => {
		return acc + (group.getsXP ? parseInt(group.players) : 0)
	  }, 0) + this.app.activePlayers.length;
	},

	totalExperiencePerPlayer(){
	  return Math.round(this.app.encounter.totalExp / this.totalPlayersToGainXP);
	},

	totalAdjustedExperiencePerPlayer(){
	  return Math.round(this.app.encounter.adjustedExp / this.totalPlayersToGainXP);
	},

	activePlayers(){
	  return this.savedParties.reduce((acc, party) => {
		return acc.concat(party.players.filter(player => player.active));
	  }, []);
	},

	monsters(){
	  const currentPage = this.currentPage-1;
	  const start = !currentPage ? 0 : (currentPage*this.monstersPerPage)+1;
	  const end = !currentPage ? this.monstersPerPage : ((currentPage+1)*this.monstersPerPage)+1
	  return this.filteredMonsters.slice(start, end);
	},
  },

  methods: {
	playerChange(player) {
	  if(player.currentHp > player.maxHp) {
		player.maxHp = player.currentHp;
	  }
	},
	showDifficultySelect() {
	  this.difficultySelectOpen = true;
	  console.log(this.difficultySelectOpen);
	},

	hideDifficultySelect() {
	  this.difficultySelectOpen = false;
	  console.log(this.difficultySelectOpen);
	},

	setSortBy(type){
	  if(type === this.sortBy){
		this.sortByDesc = !this.sortByDesc;
	  }else{
		this.sortByDesc = true;
	  }
	  this.sortBy = type;
	  this.updateFilteredMonsters();
	},

	toggleTheme() {
	  let theme = (localStorage.theme === 'dark' ? 'light' : 'dark');
	  this.theme = theme;
	  window.theme = theme;
	  localStorage.theme = theme;
	  document.documentElement.classList.toggle('dark', theme === 'dark');
	},

	enablePartyModal() {
	  this.showPartyModal = true;

	  if(this.savedParties.length === 1) {
		this.savedParties[0].editing = true;
	  }
	},

	createParty(){
	  this.savedParties.forEach((party) => party.editing = false);
	  this.savedParties.push({
		name: "Party " + (this.savedParties.length+1),
		editing: true,
		players: []
	  });
	  this.createPlayer(this.savedParties.length-1);
	},

	activateParty(partyIndex){
	  this.savedParties[partyIndex].players.forEach((player) => player.active = true);
	},

	deactivateParty(partyIndex){
	  this.savedParties[partyIndex].players.forEach((player) => player.active = false);
	},

	deleteParty(partyIndex){
	  this.savedParties.splice(partyIndex, 1);
	},

	createPlayer(partyIndex){
	  this.savedParties[partyIndex].players.push({
		name: "Player " + (this.savedParties[partyIndex].players.length+1),
		initiativeMod: 0,
		initiativeAdvantage: false,
		level: this.savedParties[partyIndex].players[this.savedParties[partyIndex].players.length - 1]?.level ?? 1,
		maxHp: this.savedParties[partyIndex].players[this.savedParties[partyIndex].players.length - 1]?.maxHp ?? 10,
		currentHp: this.savedParties[partyIndex].players[this.savedParties[partyIndex].players.length - 1]?.currentHp ?? 10,
		active: false,
		partyIndex: 0
	  });
	},

	deletePlayer(partyIndex, playerIndex) {
	  this.savedParties[partyIndex].players.splice(playerIndex,1);
	},

	async fetchData() {
	  this.formatSources(await this.fetchSources());
	  this.formatMonsters(await this.fetchMonsters());
	  this.searchPlaceholder = helpers.randomArrayElement(this.allMonsters).name;

	  if (this.loadedEncounterIndex !== null){
		this.encounter.load(this.savedEncounters[this.loadedEncounterIndex]);
	  }else if(this.encounterHistory.length && this.loadedLastEncounter){
		this.encounter.load(this.encounterHistory[this.encounterHistory.length-1]);
	  }
	},

	setPage(page){
	  if(page.divider) return;
	  this.setPageNumber(page.number)
	},

	setPageNumber(num){
	  this.currentPage = num;
	  this.updatePagination();
	},

	setMonstersPerPage(num){
	  this.monstersPerPage = num;
	  this.updatePagination();
	},

	updatePagination(){

	  this.totalPages = Math.ceil((this.filteredMonsters.length-1) / this.monstersPerPage);
	  this.currentPage = Math.max(1, Math.min(this.totalPages, this.currentPage));

	  if(this.totalPages <= 5) {
		this.pagination = Array(this.totalPages).fill({}).map((page, index) => {
		  return {
			number: index+1,
			active: this.currentPage === (index+1)
		  };
		});
	  }else if(this.currentPage < 5){
		this.pagination = [
		  { number: 1, active: this.currentPage === 1 },
		  { number: 2, active: this.currentPage === 2 },
		  { number: 3, active: this.currentPage === 3 },
		  { number: 4, active: this.currentPage === 4 },
		  { number: 5, active: this.currentPage === 5 },
		  { divider: true },
		  { number: this.totalPages }
		];
	  }else if(this.currentPage > this.totalPages-5){
		this.pagination = [
		  { number: 1 },
		  { divider: true },
		  { number: this.totalPages-4, active: this.totalPages-4 === this.currentPage },
		  { number: this.totalPages-3, active: this.totalPages-3 === this.currentPage },
		  { number: this.totalPages-2, active: this.totalPages-2 === this.currentPage },
		  { number: this.totalPages-1, active: this.totalPages-1 === this.currentPage },
		  { number: this.totalPages, active: this.totalPages === this.currentPage  }
		];
	  }else{
		this.pagination = [
		  { number: 1 },
		  { divider: true },
		  { number: this.currentPage-1 },
		  { number: this.currentPage, active: true },
		  { number: this.currentPage+1 },
		  { divider: true },
		  { number: this.totalPages }
		];
	  }
	},

	async fetchSources(){

	  if(this.loadedSources.length > 0 && helpers.versionCompare(this.sourcesVersion, this.storedSourcesVersion) === 0){
		return this.loadedSources;
	  }

	  let sources = [];

	  await fetch("/src/json/se_sources.json")
		  .then(res => res.json())
		  .then((data) => {
			sources = sources.concat(data);
		  });

	  await fetch("/src/json/se_third_party_sources.json")
		  .then(res => res.json())
		  .then((data) => {
			sources = sources.concat(data);
		  });

	  await fetch("/src/json/se_community_sources.json")
		  .then(res => res.json())
		  .then((data) => {
			sources = sources.concat(data);
		  });

	  this.loadedSources = sources.map(source => {
		source.enabled = !!source.default;
		return source;
	  });

	  return this.loadedSources;

	},

	async fetchMonsters(){

	  if(this.loadedMonsters.length > 0 && helpers.versionCompare(this.storedSourcesVersion, this.sourcesVersion) === 0){
		return this.loadedMonsters;
	  }

	  let monsters = [];

	  await fetch("/src/json/se_monsters.json")
		  .then(res => res.json())
		  .then((data) => {
			monsters = monsters.concat(data);
		  });

	  await fetch("/src/json/se_third_party_monsters.json")
		  .then(res => res.json())
		  .then((data) => {
			monsters = monsters.concat(data);
		  });

	  await fetch("/src/json/se_community_monsters.json")
		  .then(res => res.json())
		  .then((data) => {
			monsters = monsters.concat(data);
		  });

	  this.loadedMonsters = monsters;

	  this.storedSourcesVersion = this.sourcesVersion;

	  return this.loadedMonsters;
	},

	formatSources(data){
	  this.sources = data.reduce((acc, source) => {
		acc[source.name] = source;
		return acc;
	  }, {});
	},

	formatMonsters(data){
	  this.allMonsters = data.map(data => {
		const monster = new Monster(this, data);
		this.monsterLookupTable[monster.slug] = monster;
		return monster;
	  });
	  this.environments = Object.values(this.environments);
	  this.environments.sort((a, b) => {
		return a.value > b.label ? -1 : 1;
	  });
	  this.environments.unshift({ value: "any", label: "Any Environment" });
	  window.dispatchEvent(new CustomEvent('set-environments', { detail: this.environments }));
	},

	filterMonsters(crString = false, filterCallback = () => { return true; }){
	  const monsters = this.allMonsters.filter(monster => {
		return monster.sourceEnabled && filterCallback(monster) && monster.filter(this.search, this.filters, crString);
	  });
	  monsters.sort((a, b) => {
		if(this.sortBy === "cr"){
		  return this.sortByDesc ? a[this.sortBy].numeric - b[this.sortBy].numeric :  b[this.sortBy].numeric - a[this.sortBy].numeric;
		}else if(this.sortBy === "alignment"){
		  return this.sortByDesc ? a[this.sortBy].bits - b[this.sortBy].bits : b[this.sortBy].bits - a[this.sortBy].bits;
		}
		return this.sortByDesc
			? (a[this.sortBy] > b[this.sortBy] ? 1 : -1)
			: (a[this.sortBy] < b[this.sortBy] ? 1 : -1);
	  });
	  return monsters;
	},

	filtersChanged($event){
	  const { name, value, asArray } = $event.detail;
	  this.filters[name] = asArray ? Object.values(value) : value;
	  this.nonDefaultFiltersCount = Object.entries(this.filters).filter(entry => {
		const [name, filter] = entry;
		switch(name){
		  case "cr":
			return filter.min !== 0 || filter.max !== 30;
		  case "alignment":
			return filter !== CONST.ALL_ALIGNMENTS;
		  default:
			return filter.length && !filter.includes('any');
		}
	  }).length;
	  clearTimeout(this.timer);
	  this.timer = setTimeout(() => {
		this.updateFilteredMonsters();
	  }, 150);
	},

	updateFilteredMonsters(){
	  this.filteredMonsters = this.filterMonsters();
	  this.updatePagination();
	},

	resetFilters(){
	  this.search = '';
	},

	formatNumber(num){
	  if(!num) return 0;
	  return internationalNumberFormat.format(num);
	},

	setupHotkeys() {
	  hotkeys('ctrl+/,ctrl+k,ctrl+shift+\\,ctrl+f,ctrl+[,ctrl+],ctrl+g,ctrl+s,esc', (event, handler) => {
		switch(handler.key) {
		  case 'ctrl+/': this.showKeyboardModal =! this.showKeyboardModal;
			return false;
		  case 'ctrl+k': document.getElementById('search').focus();
			return false;
		  case 'ctrl+shift+\\': this.toggleTheme();
			return false;
		  case 'ctrl+f': this.showFilters = (Math.max(
			  document.body.scrollWidth,
			  document.documentElement.scrollWidth,
			  document.body.offsetWidth,
			  document.documentElement.offsetWidth,
			  document.documentElement.clientWidth
		  ) > 1535)
			  ? true
			  : this.showFilters =! this.showFilters;
			return false;
		  case 'ctrl+[': this.setPageNumber(this.currentPage-1);
			return false;
		  case 'ctrl+]': this.setPageNumber(this.currentPage+1);
			return false;
		  case 'ctrl+s': this.encounter.save();
			return false;
		  case 'ctrl+g': this.encounter.generateRandom();
			return false;
		  case 'esc':
			this.showPartyModal = false;
			this.showKeyboardModal = false;
			this.showFilters = (Math.max(
				document.body.scrollWidth,
				document.documentElement.scrollWidth,
				document.body.offsetWidth,
				document.documentElement.offsetWidth,
				document.documentElement.clientWidth
			) > 1535);
			this.showSourcesModal = false;
			break;
		}

		return true;
	  })
	},

	sendToImprovedInitiative() {

	  const data = {
		Combatants: []
	  };

	  this.encounter.groups.forEach(group => {
		const monster = group.monster;
		for(let i = 0; i < group.count; i++) {
		  data.Combatants.push({
			Name: monster.name,
			HP: { Value: monster.data.hp },
			InitiativeModifier: monster.data.init,
			AC: { Value: monster.data.ac },
			Player: "npc"
		  });
		}
	  });

	  this.savedParties.forEach((party, partyIndex) => {
		party.players.filter(player => player.active).forEach((player, playerIndex) => {
		  data.Combatants.push({
			Id: helpers.slugify(`${party.name}-${player.name}`),
			Name: player.name,
			InitiativeModifier: player.initiativeMod,
			InitiativeAdvantage: player.initiativeAdvantage,
			HP: { Value: player.currentHp, Max: player.maxHp },
			Player: "player"
		  });
		});
	  })

	  const form = document.createElement("form");
	  form.style.display = "none";
	  form.setAttribute("target", "_blank");
	  form.setAttribute("method", "POST");
	  form.setAttribute("action", "https://www.improved-initiative.com/launchencounter/");

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
	  // form.parentNode.removeChild(form);
	},
  },

  created() {
	this.setupHotkeys();
	this.encounter.app = this;
	this.party.app = this;
	this.fetchData();

	if(Math.max(
		document.body.scrollWidth,
		document.documentElement.scrollWidth,
		document.body.offsetWidth,
		document.documentElement.offsetWidth,
		document.documentElement.clientWidth
	) > 1535) {
	  this.showFilters = true;
	}

	this.$watch('sources', () => { this.enabledSources = Object.values(this.sources).filter(source => source.enabled) });
  },
};
</script>

<template>
  <div
	  class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 flex flex-col"
  >

	<div class="flex py-4 sm:py-6 lg:py-8 w-full max-w-[2560px] relative grow mx-auto flex-col md:flex-row">
	  <div class="relative self-center mb-6 bg-gray-200 dark:bg-gray-800 rounded-lg p-0.5 flex sm:mt-8 h-10 md:hidden">
		<div class="absolute bg-gray-100 dark:bg-gray-700 w-1/2 transition-all duration-300 inset-y-1 rounded-md" :class="{ 'translate-x-full -ml-1.5': mobileEncounterTab, 'left-1': !mobileEncounterTab }"></div>
		<button @click="mobileEncounterTab = false" type="button" :class="{ 'text-gray-900 ': !mobileEncounterTab, 'text-gray-700': mobileEncounterTab }" class="relative border-gray-200 rounded-md shadow-sm py-2 text-sm font-medium dark:text-gray-100 whitespace-nowrap focus:outline-none focus:z-10 w-40">Encounter <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 dark:bg-gray-300 text-gray-800" v-text="encounter.groups.reduce((carry, item) => carry + item.count, 0)" v-show="encounter.groups.length"></span></button>
		<button @click="mobileEncounterTab = true" type="button" :class="{ 'text-gray-900 ': mobileEncounterTab, 'text-gray-700': !mobileEncounterTab }" class="ml-0.5 relative border border-transparent rounded-md py-2 text-sm font-medium whitespace-nowrap dark:text-gray-100 focus:outline-none focus:z-10 w-40">Monsters</button>
	  </div>

	  <div id="monsters_box" :class="{ 'hidden md:block': !mobileEncounterTab }" class="grow px-4 md:pr-0 md:absolute md:inset-y-0 md:py-8 left-0 right-0 md:inset-none md:pl-[28rem] 2xl:right-[24rem] overflow-y-auto scrollbar">
		<label for="search" class="max-w-full block text-sm font-medium text-gray-700 sr-only">Search monsters</label>

		<div class="px-4 sm:px-6 lg:px-8">
		  <div class="max-w-full mt-1 flex flex-col lg:flex-row rounded-md shadow-sm">
			<div class="relative items-stretch grow focus-within:z-10">
			  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			  </div>

			  <input type="search" name="search" id="search" v-model="search" @input.debounce="updateFilteredMonsters" class="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-md lg:rounded-r-none pl-10 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600" :placeholder="searchPlaceholder">

			  <div class="absolute inset-y-0 right-0 flex py-1.5 pr-2 hidden md:block">
				<kbd class="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-sm font-sans font-medium text-gray-400" v-text="keyboardText"></kbd>
			  </div>
			</div>

			<div class="flex w-full lg:w-auto mt-2 lg:mt-0">
			  <div class="w-full lg:w-auto">
				<select id="monstersPerPage" @change="setMonstersPerPage(Number($event.target.value))" name="location" class="block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-l-md lg:rounded-none 2xl:rounded-r-md border-gray-300 border-l-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600">
				  <option value="10" :selected="monstersPerPage === 10">10 per page</option>
				  <option value="25" :selected="monstersPerPage === 25">25 per page</option>
				  <option value="50" :selected="monstersPerPage === 50">50 per page</option>
				  <option value="100" :selected="monstersPerPage === 100">100 per page</option>
				</select>
			  </div>

			  <div class="relative inline-block text-left 2xl:hidden" x-data="{ filtersMenu: true }" x-tippy="Filter monsters (Ctrl+L)">
				<button @click="showFilters =! showFilters" type="button" class="-ml-px h-full relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md bg-white disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-400 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500">
				  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
				  </svg>
				  <span>Filter</span>
				  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-300 text-gray-800" v-show="nonDefaultFiltersCount > 0" v-text="nonDefaultFiltersCount"></span>
				</button>
			  </div>
			</div>
		  </div>
		</div>

		<!-- This example requires Tailwind CSS v2.0+ -->
		<div class="px-4 sm:px-6 lg:px-8">

		  <div class="-mx-4 mt-8 overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
			<table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
			  <thead class="bg-gray-50 dark:bg-gray-700">
			  <tr>
				<th scope="col" class="py-3.5 px-3 text-center text-sm font-semibold text-gray-900 sm:pl-6 w-8 max-w-8">
				  <span class="sr-only">Add to encounter</span>
				</th>
				<th scope="col" class="py-3.5 px-3 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none cursor-pointer group whitespace-nowrap w-64" @click="setSortBy('name')">
				  Name
				  <span class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible" :class="{ 'invisible': sortBy !== 'name' }">
                                        <i class="fa-solid" :class="{
                                            'fa-chevron-down': sortByDesc || sortBy !== 'name',
                                            'fa-chevron-up': !sortByDesc && sortBy === 'name'
                                        }"></i>
                                    </span>
				</th>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none cursor-pointer table-cell group whitespace-nowrap w-32" @click="setSortBy('size')">
				  Size
				  <span class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible" :class="{ 'invisible': sortBy !== 'size' }">
                                        <i class="fa-solid" :class="{
                                            'fa-chevron-down': sortByDesc || sortBy !== 'size',
                                            'fa-chevron-up': !sortByDesc && sortBy === 'size'
                                        }"></i>
                                    </span>
				</th>
				<th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none cursor-pointer sm:table-cell group whitespace-nowrap w-32" @click="setSortBy('cr')">
				  CR
				  <span class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible" :class="{ 'invisible': sortBy !== 'cr' }">
                                        <i class="fa-solid" :class="{
                                            'fa-chevron-down': sortByDesc || sortBy !== 'cr',
                                            'fa-chevron-up': !sortByDesc && sortBy === 'cr'
                                        }"></i>
                                    </span>
				</th>
				<th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none cursor-pointer lg:table-cell group whitespace-nowrap w-32" @click="setSortBy('type')">
				  Type
				  <span class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible" :class="{ 'invisible': sortBy !== 'type' }">
                                        <i class="fa-solid" :class="{
                                            'fa-chevron-down': sortByDesc || sortBy !== 'type',
                                            'fa-chevron-up': !sortByDesc && sortBy === 'type'
                                        }"></i>
                                    </span>
				</th>
				<th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none cursor-pointer lg:table-cell group whitespace-nowrap w-32" @click="setSortBy('alignment')">
				  Alignment
				  <span class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible" :class="{ 'invisible': sortBy !== 'alignment' }">
                                        <i class="fa-solid" :class="{
                                            'fa-chevron-down': sortByDesc || sortBy !== 'alignment',
                                            'fa-chevron-up': !sortByDesc && sortBy === 'alignment'
                                        }"></i>
                                    </span>
				</th>
			  </tr>
			  </thead>
			  <tbody class="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-900">
			  <div v-for="monster in monsters">
				<tr class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-800">
				  <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-300 text-center w-8 max-w-8">
										<span class="primary-link cursor-pointer select-none"
											  @click="encounter.addMonster(monster)"
											  x-tooltip="encounter.getDifficultyFromExperience(monster.cr.exp)"
										>Add</span>
				  </td>
				  <td class="w-full max-w-0 py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 w-64 max-w-64 truncate">
					<span class="truncate" v-text="monster.name"></span>
					<dl class="font-normal">
					  <dt class="sr-only">Sources</dt>
					  <dd class="mt-1 truncate text-gray-500 dark:text-gray-400">
						<div v-for="(source, index) of monster.sources">
                                                    <span x-tooltip="source.fullText"
														  x-html="
                                                        `<span class='underline decoration-dotted cursor-help underline-offset-2 decoration-gray-400 dark:decoration-gray-500'>${source.reference.shortname}</span>`
                                                        + (index < monster.sources.length-1 ? ', ' : '')
                                                    "></span>
						</div>
					  </dd>
					  <dt class="sr-only sm:hidden">Type</dt>
					  <dd class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden" v-text="monster.type"></dd>
					</dl>
				  </td>
				  <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 table-cell w-32 max-w-32 truncate">
					<span class="truncate" v-text="monster.size"></span>
					<dl class="font-normal">
					  <dt class="sr-only sm:hidden">CR</dt>
					  <dd class="mt-1 truncate text-gray-500 dark:text-gray-400 sm:hidden">CR <span v-text="monster.cr.string" :class="{
												'text-indigo-300 dark:text-indigo-600': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Trivial',
												'text-green-300 dark:text-green-600': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Easy',
												'text-yellow-300 dark:text-yellow-600': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Medium',
												'text-amber-300 dark:text-orange-600': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Hard',
												'text-rose-300 dark:text-rose-600': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Deadly'
											}"></span></dd>
					  <dt class="sr-only sm:hidden">Alignment</dt>
					  <dd class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden" v-text="monster.alignment.string"></dd>
					</dl>
				  </td>
				  <td class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 sm:table-cell w-32">
										<span :class="{
												'text-cyan-600 dark:text-cyan-400': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Trivial',
												'text-green-600 dark:text-green-400': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Easy',
												'text-yellow-600 dark:text-yellow-400': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Medium',
												'text-amber-600 dark:text-orange-400': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Hard',
												'text-rose-600 dark:text-rose-500': encounter.getDifficultyFromExperience(monster.cr.exp) === 'Deadly'
											}">
											<span v-text="monster.cr.string"></span>
											<span v-text="'(' + encounter.getDifficultyFromExperience(monster.cr.exp) + ')'" class="text-xs"></span>
										</span>
				  </td>
				  <td class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32" v-text="monster.type"></td>
				  <td class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32" v-text="monster.alignment.string"></td>
				</tr>
			  </div>
			  </tbody>
			</table>
		  </div>

		  <div v-show="enabledSources.length === 0" class="w-full text-center text-lg my-4">No sources are enabled - <span class="primary-link select-none cursor-pointer" @click="showSourcesModal = true">enable some now</span></div>
		  <div v-show="enabledSources.length > 0 && filteredMonsters.length === 0" class="w-full text-center text-lg my-4" x-cloak>No monsters found with the current filter - <span class="primary-link select-none cursor-pointer" @click="$dispatch('reset-filters')">reset filters</span></div>

		  <!-- This example requires Tailwind CSS v2.0+ -->
		  <nav v-show="totalPages > 1" x-cloak class="border-t border-gray-300 mt-4 dark:border-gray-700 px-4 flex items-center justify-between sm:px-0">
			<div class="-mt-px w-0 flex-1 flex">
			  <a @click="setPageNumber(currentPage-1)" :disabled="currentPage === 1" href="#" class="border-t-2 border-transparent pt-4 px-2 lg:pr-1 lg:pl-0 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-400 hover:border-gray-400">
				<!-- Heroicon name: solid/arrow-narrow-left -->
				<svg class="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				  <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
				</svg>
				<span class="hidden lg:inline">Previous</span>
			  </a>
			</div>
			<div class="hidden md:-mt-px md:flex">
			  <div v-for="page of pagination">
								<span :class="{
									'cursor-pointer select-none border-emerald-600 text-emerald-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium': page.active && !page.divider,
									'cursor-pointer select-none border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-400 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium hidden lg:inline-block first-of-type:inline-block last-of-type:inline-block': !page.active && !page.divider,
									'select-none border-transparent text-gray-500 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium': page.divider,
								}" v-text="page.divider ? '...' : page.number" @click="setPage(page)" :key="page.number"></span>
			  </div>
			</div>
			<div class="-mt-px w-0 flex-1 flex justify-end">
			  <a href="#" @click="setPageNumber(currentPage+1)" class="border-t-2 border-transparent pt-4 px-2 lg:pr-1 lg:pl-0 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-400 hover:border-gray-400">
				<span class="hidden lg:inline">Next</span>
				<!-- Heroicon name: solid/arrow-narrow-right -->
				<svg class="ml-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				  <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			  </a>
			</div>
		  </nav>
		</div>
	  </div>

	  <div id="encounter_box" :class="{ 'hidden md:flex': mobileEncounterTab }" class="hidden md:absolute md:inset-y-0 md:py-8 md:left-4 md:pr-4 md:pl-4 pb-8 md:flex w-full px-8 2xl:pr-4 flex-col flex-shrink-0 md:w-[28rem] overflow-y-auto scrollbar">
		<div class="grid grid-cols-3 md:pr-2 md:grid-cols-5 pb-4 flex-col w-full">

		  <div class="col-span-3 space-y-2">
			<div class="flex justify-between items-end">
			  <div class="mb-1 text-gray-600 dark:text-gray-400">
				Party
			  </div>

			  <a class="primary-link text-sm" @click="showPartyModal = true" href="javascript:">
				Manage
			  </a>
			</div>

			<div class="grid grid-cols-[1fr_34px] gap-y-2 align-center mb-2" v-show="activePlayers.length">

			  <div v-for="party in savedParties">
				<div v-for="player in party.players.filter(player => player.active)">
				  <div class="contents">
					<div v-text="player.name"></div>

					<button @click="player.active = false" type="button" class="button-danger-outline-md inline-flex justify-center !py-0">
					  <i class="fas fa-times"></i>
					</button>
				  </div>
				</div>
			  </div>

			</div>

			<div v-show="party.groups.length" class="w-full grid grid-rows-[18px_1fr] grid-cols-[1fr_40px_1fr_50px_36px] gap-y-2 align-center mb-2">
			  <label class="col-span-2 text-sm text-gray-700 dark:text-gray-300">Players</label>
			  <label class="text-sm text-gray-700 dark:text-gray-300">Level</label>
			  <label class="text-center text-sm text-gray-700 dark:text-gray-300" x-tippy="Determines whether these characters get a share of XP from the encounter.">XP</label>
			  <div>&nbsp;</div>


			  <div v-for="(group, index) in party.groups">
				<div class="contents">
				  <input type="number" min="1" :value="group.players" @change="group.players = Math.max(1, $event.target.value)" class="border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5 pr-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md" value="4">

				  <div class="text-center grid place-items-center text-gray-600 dark:text-gray-400 scale-150 md:transform-none">
					<i class="fa fa-times"></i>
				  </div>

				  <input type="number" min="1" max="20" :value="group.level" @change="group.level = Math.max(1, Math.min(20, $event.target.value))" class="border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5 pr-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md" value="4">

				  <div class="flex items-center justify-center scale-150 md:transform-none">
					<input type="checkbox" v-model="group.getsXP" class="focus:ring-emerald-500 h-4 w-4 text-emerald-600 disabled:opacity-70 border-gray-300 rounded">
				  </div>

				  <button @click="party.removePlayerGroup(index)" type="button" class="button-danger-outline-md justify-center">
					<i class="fas fa-times"></i>
				  </button>
				</div>
			  </div>

			</div>

			<div class="w-full">
			  <button @click="party.addPlayerGroup()" type="button" class="button-primary-outline-md align-self-start w-full md:mt-4 md:mt-auto flex justify-center">
								<span>
									<i class="fas fa-plus mr-2"></i> Add Generic Group
								</span>
			  </button>
			</div>

			<div class="w-full" v-show="!(activePlayers.length || party.groups.length)">
			  <button @click="enablePartyModal" type="button" class="button-primary-outline-md align-self-start w-full md:mt-4 md:mt-auto flex justify-center">
								<span>
									<i class="fas fa-plus mr-2"></i> Use Detailed Party
								</span>
			  </button>
			</div>
		  </div>

		  <div class="hidden md:block col-span-2">
			<div class="grid text-sm text-right">
			  <div class="hidden md:block mb-1 col-span-2 text-gray-600 text-base dark:text-gray-400">XP Goals</div>
			  <div :class="{ 'font-semibold': encounter.actualDifficulty === 'Easy'}">Easy</div><div :class="{ 'font-semibold': encounter.actualDifficulty === 'Easy'}" v-text="formatNumber(party.experience['easy'])"></div>
			  <div :class="{ 'font-semibold': encounter.actualDifficulty === 'Medium'}">Medium</div><div :class="{ 'font-semibold': encounter.actualDifficulty === 'Medium'}" v-text="formatNumber(party.experience['medium'])"></div>
			  <div :class="{ 'font-semibold': encounter.actualDifficulty === 'Hard'}">Hard</div><div :class="{ 'font-semibold': encounter.actualDifficulty === 'Hard'}" v-text="formatNumber(party.experience['hard'])"></div>
			  <div :class="{ 'font-semibold': encounter.actualDifficulty === 'Deadly'}">Deadly</div><div :class="{ 'font-semibold': encounter.actualDifficulty === 'Deadly'}" v-text="formatNumber(party.experience['deadly'])"></div>

			  <div class="mt-4">Daily budget</div>
			  <div class="mt-4" v-text="formatNumber(party.experience.daily)"></div>
			</div>
		  </div>

		  <div class="md:hidden col-span-3 pt-4" v-show="party.experience.daily">
			<div class="mb-1 col-span-2 text-gray-600 text-base dark:text-gray-400">XP Goal</div>
			<div class="flex justify-between">
			  <div>
				Daily budget <span v-text="formatNumber(party.experience.daily)"></span>
			  </div>
			  <div>
				<span class="font-semibold" v-show="['Easy', 'Medium', 'Hard', 'Deadly'].includes(encounter.actualDifficulty)" v-text="encounter.actualDifficulty + ' ' + formatNumber(party.experience[encounter.actualDifficulty.toLowerCase()])"></span>
			  </div>
			</div>
		  </div>
		</div>

		<div class="border-t border-gray-200 dark:border-gray-700">
		  <div class="flex pt-4 justify-between items-center mb-1">
			<span class="text-gray-600 dark:text-gray-400">Encounter</span>

			<a href="javascript:" class="primary-link text-sm" @click="showEncounterModal = true">History</a>
		  </div>

		  <div class="flex flex-col sm:flex-row pb-4 w-full space-x-2 items-end justify-between pb-4">
			<div class="grid gap-2 w-full place-items-end sm:grid-cols-8 grow">
			  <div class="w-full col-span-1 sm:col-span-3">
				<label id="difficulty-label" class="sr-only"> Difficulty </label>
				<div class="mt-1 relative" @click.outside="difficultySelectOpen = false">
				  <button @click="difficultySelectOpen = true" type="button" class="bg-white dark:bg-gray-700 relative w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
					<span class="block truncate" v-text="(difficulty.slice(0,1).toUpperCase() + difficulty.slice(1))"></span>
					<span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
										<svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										  <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
										</svg>
									  </span>
				  </button>

				  <ul v-show="difficultySelectOpen" class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label"
					  x-transition:enter=""
					  x-transition:enter-start=""
					  x-transition:enter-end=""
					  x-transition:leave="transition ease-in duration-100"
					  x-transition:leave-start="opacity-100"
					  x-transition:leave-end="opacity-0"
				  >
					<div v-for="option of ['easy', 'medium', 'hard', 'deadly']">
					  <li @click="difficulty = option; difficultySelectOpen = false;" :class="{ 'text-white bg-emerald-600': difficulty === option, 'text-gray-900 dark:text-gray-300': difficulty !== option }" class="group text-gray-900 hover:text-white hover:bg-emerald-600 cursor-default select-none relative py-2 pl-3 pr-9" role="option">
						<span class="group-hover:text-white font-normal block truncate" x-html="(option.slice(0,1).toUpperCase() + option.slice(1))"> </span>
						<span :class="{ 'text-gray-200': difficulty === option, 'text-gray-600 dark:text-gray-400': difficulty !== option }" class="text-xs group-hover:text-gray-200" v-text="formatNumber(party.experience[option]) + 'xp'"></span>

						<span v-show="difficulty === option" :class="{ 'text-white': difficulty === option, 'text-emerald-600': difficulty !== option }" class="absolute inset-y-0 right-0 flex items-center pr-4">
												  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
												  </svg>
											</span>
					  </li>
					</div>
				  </ul>
				</div>
			  </div>

			  <div class="w-full col-span-1 sm:col-span-5">
				<label id="composition-label" class="sr-only"> Composition </label>
				<div class="mt-1 relative" @click.outside="encounterTypeSelectOpen = false">
				  <button @click="encounterTypeSelectOpen = true" type="button" class="bg-white dark:bg-gray-700 relative w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="composition-label">
					<span class="block truncate" v-text="encounterTypes[encounterType].label"></span>
					<span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
										<svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										  <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
										</svg>
									  </span>
				  </button>

				  <ul v-show="encounterTypeSelectOpen" class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="composition-label"
					  x-transition:enter=""
					  x-transition:enter-start=""
					  x-transition:enter-end=""
					  x-transition:leave="transition ease-in duration-100"
					  x-transition:leave-start="opacity-100"
					  x-transition:leave-end="opacity-0"
				  >
					<div v-for="type of Object.values(encounterTypes)">
					  <li @click="encounterType = type.key; encounterTypeSelectOpen = false;" :class="{ 'text-white bg-emerald-600': encounterType === type.key, 'text-gray-900 dark:text-gray-300': encounterType !== type.key }" class="text-gray-900 hover:text-white hover:bg-emerald-600 cursor-default select-none relative py-2 pl-3 pr-9" role="option">
						<span class="font-normal block truncate" v-text="type.label"> </span>

						<span :class="{ 'text-white': encounterType === type.key, 'text-emerald-600': encounterType !== type.key }" class="absolute inset-y-0 right-0 flex items-center pr-4">
											  <svg v-show="encounterType === type.key" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
											  </svg>
											</span>
					  </li>
					</div>
				  </ul>
				</div>
			  </div>
			</div>

			<div class="w-full md:w-auto shrink mt-3 md:mt-0" :class="{ 'hidden md:block': !encounter.groups.length }">
			  <button @click="encounter.generateRandom()" class="button-primary-md w-full md:w-auto">
								<span class="md:hidden w-full text-center">
									Generate
								</span>
				<span class="hidden md:inline">
									<i class="fa fa-refresh"></i>
								</span>
			  </button>
			</div>
		  </div>
		</div>

		<div class="border-t border-gray-200 dark:border-gray-700 pt-4" v-show="encounter.groups.length">
		  <div v-for="(group, index) in encounter.groups" :key="group.monster.slug">
			<div class="flex flex-row w-full mb-4 relative">
			  <div class="grow pb-2 min-w-0">
				<div class="grid grid-cols-[1fr_20px] mb-2">
				  <span x-tooltip="group.monster.name" data-tippy-placement="top-start" data-tippy-delay="1000" class="text-lg pr-3 font-semibold max-w-full overflow-ellipsis truncate" v-text="group.monster.name"></span>
				  <div x-tippy="Shuffle monster" @click="encounter.getNewMonster(group)" class="grid place-items-center text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 cursor-pointer"><i class="fas fa-random"></i></div>
				</div>

				<div>
				  <span class="text-base" v-text="'CR: ' + group.monster.cr.string"></span>
				  <span class="text-base ml-4" v-text="'XP: ' + formatNumber(group.monster.cr.exp)"></span>
				  <div class='overflow-hidden whitespace-nowrap overflow-ellipsis pr-40'>
					<ul class="list-none text-s italic max-w-full">
					  <div v-for="source in group.monster.sources">
						<li class="max-w-full truncate" x-tooltip="source.fullText" data-tippy-delay="1000" x-html="source.reference.link ? `<a class='primary-link' href='${source.reference.link}' target='_blank'>${source.fullText}</a>` : source.fullText"></li>
					  </div>
					</ul>
				  </div>
				</div>
			  </div>
			  <div class="absolute bottom-3 right-0 flex shrink-0 items-center">
				<div class="flex rounded-md shadow-sm">
				  <button @click="encounter.addCount(index)" class="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 sm:text-sm">
					<i class="fa fa-plus w-5"></i>
				  </button>
				  <label for="monster-number"></label>
				  <input id="monster-number" type="number" min="1" class="flex-1 min-w-0 block w-16 px-3 py-2 rounded-none dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300" :value="group.count" @change="group.count = Math.max(0, $event.target.value)">
				  <button @click="encounter.subtractCount(index)" :class="{ 'border-gray-300 dark:border-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500': group.count > 1, 'border-red-200 dark:border-red-700 dark:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:hover:bg-red-700 text-red-500': group.count === 1 }" class="inline-flex items-center px-2 rounded-r-md border border-l-0 sm:text-sm">
					<i :class="{ 'fa-minus': group.count > 1, 'fa-times': group.count === 1 }" class="fa w-5"></i>
				  </button>
				</div>
			  </div>
			</div>
		  </div>

		  <div v-show="encounter.groups.length" class="-mt-2 text-center pb-4">
			<a @click="encounter.clear()" class="select-none text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200" href="javascript:"><i class="fa fa-times"></i> Clear encounter</a>
		  </div>
		</div>

		<div v-show="!encounter.groups.length" class="pb-4">
		  <button @click="encounter.generateRandom()" type="button" class="relative block w-full border-2 border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 border-dashed rounded-lg p-6 md:p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
			<i class="fa-solid fa-wand-sparkles text-2xl h-12 w-12 mx-auto text-gray-400 dark:text-gray-300"></i>
			<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200"> Generate an encounter </span>
		  </button>
		</div>

		<div class="border-t border-gray-200 dark:border-gray-700">
		  <dl class="space-y-1 divide-y divide-dashed divide-gray-400 dark:divide-gray-700">
			<div class="flex items-center justify-between">
			  <dt class="mt-1 text-sm text-gray-600 dark:text-gray-200">
				<span class="block">Difficulty</span>
			  </dt>
			  <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300 text-right">
				<span class="block" v-text="encounter.actualDifficulty"></span>
				<span class="block text-gray-500 dark:text-gray-400 text-sm" v-show="encounter.difficultyFeel && encounter.actualDifficulty.toLowerCase() !== encounter.difficultyFeel.toLowerCase()" v-text="'Feels '+encounter.difficultyFeel"></span>
			  </dd>
			</div>

			<div class="flex items-center justify-between">
			  <dt class="mt-1 text-sm text-gray-600 dark:text-gray-200">Total XP</dt>
			  <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300" v-text="encounter.totalExp > 0 ? formatNumber(encounter.totalExp) + ' (' + formatNumber(Math.round(encounter.totalExp / party.totalPlayersToGainXP)) + '/player)' : 'N/A'"></dd>
			</div>

			<div class="flex items-center justify-between">
			  <dt class="mt-1 text-sm text-gray-600 dark:text-gray-200">Adjusted XP</dt>
			  <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300" v-text="encounter.adjustedExp > 0 ? formatNumber(encounter.adjustedExp) + ' (' + formatNumber(Math.round(encounter.adjustedExp / party.totalPlayersToGainXP)) + '/player)' : 'N/A'"></dd>
			</div>
		  </dl>

		  <div class="mt-4 flex space-x-2">
			<button :disabled="!encounter.groups.length" class="grow text-center button-primary-md" @click="sendToImprovedInitiative">
							<span class="inline-flex justify-center w-full">
								<img class="mr-2 fill-white" style="height:20px;" src="images/improved-initiative-logo.svg" alt="II"/> Send to Improved Initiative
							</span>
			</button>

			<button  :disabled="!encounter.groups.length" class="button-primary-md shrink-0" @click="encounter.save()">
			  <i class="fa fa-save"></i>
			</button>
		  </div>
		</div>
	  </div>

	  <div class="fixed 2xl:static 2xl:pointer-events-none inset-0 z-50 2xl:z-0 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true" v-show="showFilters" x-cloak>
		<div class="absolute 2xl:static inset-0 overflow-hidden">
		  <!-- Background overlay, show/hide based on slide-over state. -->
		  <div @click="showFilters = false" class="absolute 2xl:hidden inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity 2xl:duration-0" aria-hidden="true"
			   x-transition:enter="ease-in-out duration-200"
			   x-transition:enter-start="opacity-0 2xl:opacity-100"
			   x-transition:enter-end="opacity-100"
			   x-transition:leave="ease-in-out duration-200"
			   x-transition:leave-start="opacity-100"
			   x-transition:leave-end="opacity-0 2xl:opacity-100"
			   v-show="showFilters"
		  ></div>

		  <FiltersSlideover />
		</div>
	  </div>
	</div>


	<!-- This example requires Tailwind CSS v2.0+ -->
	<div v-show="showSourcesModal" class="fixed z-50 inset-0 overflow-y-auto scrollbar" aria-labelledby="modal-title" role="dialog" aria-modal="true" x-cloak>
	  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity" aria-hidden="true"
			 v-show="showSourcesModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0"
			 x-transition:enter-end="opacity-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100"
			 x-transition:leave-end="opacity-0"
		></div>

		<!-- This element is to trick the browser into centering the modal contents. -->
		<span class="hidden sm:inline-block align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

		<div @mousedown.outside="showSourcesModal = false" class="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 align-middle max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl w-full"
			 v-show="showSourcesModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			 x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
		>
		  <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
			<div class="sm:flex sm:items-start">
			  <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-600 sm:mx-0 sm:h-10 sm:w-10">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600 dark:text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
				</svg>
			  </div>
			  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
				<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">Select your sources</h3>
				<div class="mt-2 max-h-96 overflow-y-auto px-1 scrollbar scrollbar-dark">

				  <div v-for="type of sourcesByType">
					<div class="mb-4">
					  <h4 class="text-gray-700 dark:text-gray-300 leading-6 mb-2" v-text="type.title"></h4>

					  <div class="grid gap-2 grid-cols-6 md:grid-cols-12 w-full">
						<div v-for="source of type.sources">
						  <div class="col-span-6 grid gap-2"
							   :class="{
														 	'grid-cols-[1fr_42px]': source.custom && !deleting,
														 	'grid-cols-[42px_1fr_42px]': source.custom && deleting
														 }"
							   x-data="{ deleting: false }"
							   @click.away="deleting = false"
						  >
							<button class="text-left text-sm max-w-full truncate"
									v-show="!deleting"
									@click="source.enabled =! source.enabled; updateFilteredMonsters();"
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

							<button v-show="deleting" class="!px-0 w-[42px] justify-center button-danger-outline-md" @click="deleteImportedSource(source.name)">
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
						</div>
					  </div>
					</div>
				  </div>

				</div>
			  </div>
			</div>
		  </div>

		  <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
			<button @click="showSourcesModal = false" type="button" class="button-primary-md">Done</button>
			<!--						<button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>-->
		  </div>
		</div>
	  </div>
	</div>

	<!-- This example requires Tailwind CSS v2.0+ -->
	<div v-show="showEncounterModal" class="fixed z-10 inset-0 overflow-y-auto scrollbar" aria-labelledby="modal-title" role="dialog" aria-modal="true" x-cloak>
	  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity" aria-hidden="true"
			 v-show="showEncounterModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0"
			 x-transition:enter-end="opacity-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100"
			 x-transition:leave-end="opacity-0"
		></div>

		<!-- This element is to trick the browser into centering the modal contents. -->
		<span class="hidden sm:inline-block align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

		<div @mousedown.outside="showEncounterModal = false" class="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 align-middle sm:max-w-2xl w-full"
			 v-show="showEncounterModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			 x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			 x-data="{ tab: 'history' }"
		>
		  <div class="bg-white dark:bg-gray-800 px-4 py-5 sm:p-6">
			<div class="sm:flex flex-col sm:items-start w-full">
			  <div class="w-full flex pb-3">
				<div class="sm:hidden w-full">
				  <label for="tabs" class="sr-only">Select a tab</label>
				  <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
				  <select v-model="tab" id="tabs" name="tabs" class="text-center border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5 pr-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md">
					<option value="history" selected>Encounter History</option>

					<option value="saved">Saved Encounters</option>
				  </select>
				</div>
				<div class="hidden w-full sm:block">
				  <div class="border-b-2 border-gray-200 dark:border-gray-700">
					<nav class="-mb-[2px] justify-center flex space-x-8" aria-label="Tabs">
					  <!-- Current: "border-emerald-500 text-emerald-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" -->
					  <a @click="tab = 'history'" href="javascript:" :class="{ 'border-emerald-500 text-emerald-600': tab === 'history', 'border-transparent text-gray-500 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500 hover:text-gray-700 hover:border-gray-300': tab !== 'history' }" class="inline-block whitespace-nowrap py-4 px-1 border-b-2 font-medium">
						<i class="fa fa-history pr-2"></i> Encounter History
					  </a>

					  <a @click="tab = 'saved'" href="javascript:" :class="{ 'border-emerald-500 text-emerald-600': tab === 'saved', 'border-transparent text-gray-500 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500 hover:text-gray-700 hover:border-gray-300': tab !== 'saved' }" class="inline-block whitespace-nowrap py-4 px-1 border-b-2 font-medium">
						<i class="fa fa-save pr-2"></i> Saved Encounters
					  </a>
					</nav>
				  </div>
				</div>
			  </div>

			  <div v-show="tab === 'saved'" class="my-3 sm:mt-0 w-full">
				<div class="mt-2 max-h-96 overflow-y-auto scrollbar divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
				  <div v-for="(_, index) of savedEncounters">
					<div @click="(loadedEncounterIndex !== savedEncounters.length-index-1) && encounter.loadFromSaved(savedEncounters.length-index-1)" class="flex px-2 py-4 dark:border-gray-700 w-100 relative"
						 x-tooltip="savedEncounters[savedEncounters.length-index-1].map(group => `${group.monster.name} x${group.count}`).join(', ')"
						 :key="index"
						 :class="{ 'group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer': loadedEncounterIndex !== savedEncounters.length-index-1 }"
					>
					  <div class="grow flex items-center mr-2 grow truncate overflow-ellipsis" :class="{ 'font-medium': loadedEncounterIndex === savedEncounters.length-index-1 }">
                                                <span v-text="savedEncounters[savedEncounters.length-index-1] ? savedEncounters[savedEncounters.length-index-1].map(group => `${group.monster.name} x${group.count}`).join(', ') : ''"
												></span>
					  </div>
					  <div class="shrink-0 grid grid-cols-[30px_1fr] place-items-center h-full absolute inset-y-0 right-0" type="button">
						<div class="w-full h-full bg-gradient-to-l from-white dark:from-gray-800 group-hover:from-gray-50 dark:group-hover:from-gray-700 to-transparent"></div>
						<div class="flex px-3 bg-white group-hover:bg-gray-50 dark:bg-gray-800 dark:group-hover:bg-gray-700 min-w-4 h-full text-right inset-y-0 right-0 space-x-2 absolute">
						  <div v-show="loadedEncounterIndex === savedEncounters.length-index-1" class="text-emerald-600 h-full flex items-center justify-center"><i class="fa fa-check-circle pr-1"></i> Loaded</div>
						  <div v-show="loadedEncounterIndex !== savedEncounters.length-index-1" class="items-center h-full justify-center cursor-pointer select-none hidden group-hover:flex text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"><i class="pr-1 fas fa-upload"></i> Load</div>
						  <div class="items-center justify-center h-full cursor-pointer select-none hidden group-hover:flex text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-600" @click="encounter.deleteSaved(index)"><i class="pr-1 fas fa-times"></i> Delete</div>
						</div>
					  </div>
					</div>
				  </div>
				</div>

				<div v-show="!savedEncounters.length" type="button" class="relative block w-full border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg p-12 text-center">
				  <span class="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200"> You have no encounters saved </span>
				</div>
			  </div>

			  <div v-show="tab === 'history'" class="my-3 sm:mt-0 w-full">
				<div class="mt-2 max-h-96 overflow-y-auto scrollbar divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
				  <div v-for="(_, index) of encounterHistory">
					<div class="flex px-2 py-4 dark:border-gray-700 w-100 relative"
						 x-tooltip="encounterHistory[encounterHistory.length-index-1].map(group => `${group.monster.name} x${group.count}`).join(', ')"
						 :class="{ 'group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer': !(loadedEncounterIndex === null && index === 0 && encounter.groups.length) }"
						 @click="!(loadedEncounterIndex === null && index === 0 && encounter.groups.length) && encounter.loadFromHistory(encounterHistory.length-index-1)"
						 :key="index"
					>
					  <div class="grow flex flex-col justify-center mr-2 grow truncate overflow-ellipsis" :class="{ 'font-medium': loadedEncounterIndex === null && index === 0 && encounter.groups.length }">
                                                <span v-text="encounterHistory[encounterHistory.length-index-1] ? encounterHistory[encounterHistory.length-index-1].map(group => `${group.monster.name} x${group.count}`).join(', ') : ''"
												></span>
					  </div>
					  <div class="shrink-0 grid grid-cols-[30px_1fr] place-items-center h-full absolute inset-y-0 right-0" type="button">
						<div class="w-full h-full bg-gradient-to-l from-white dark:from-gray-800 group-hover:from-gray-50 dark:group-hover:from-gray-700 to-transparent"></div>
						<div class="px-3 bg-white group-hover:bg-gray-50 dark:bg-gray-800 dark:group-hover:bg-gray-700 min-w-4 h-full grid place-items-center">
						  <div class="hidden group-hover:block text-gray-900 dark:text-gray-100">Load <i class="fa fa-arrow-right"></i></div>
						  <div v-show="loadedEncounterIndex === null && index === 0 && encounter.groups.length" class="text-emerald-600"><i class="fa fa-check-circle"></i></div>
						</div>
					  </div>
					</div>
				  </div>
				</div>

				<button v-show="!encounterHistory.length" @click="encounter.generateRandom(); showEncounterModal = false;" type="button" class="relative block w-full border-2 border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
				  <i class="fa-solid fa-dice-d20 text-2xl h-12 w-12 mx-auto text-gray-400 dark:text-gray-300"></i>
				  <span class="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200"> Roll for history </span>
				</button>
			  </div>
			</div>
		  </div>

		  <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between">
			<button @click="showEncounterModal = false" type="button" class="button-primary-md">Close</button>
			<button v-show="tab === 'history'" @click="encounterHistory = []" type="button" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 dark:bg-emerald-100 dark:bg-transparent dark:text-emerald-500 dark:hover:bg-emerald-800 dark:hover:text-white hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"> <i class="fa fa-times mr-1"></i> Clear History </button>
		  </div>
		</div>
	  </div>
	</div>

	<div v-show="showPartyModal" class="fixed z-10 inset-0 overflow-y-auto scrollbar" aria-labelledby="modal-title" role="dialog" aria-modal="true" x-cloak>
	  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity" aria-hidden="true"
			 v-show="showPartyModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0"
			 x-transition:enter-end="opacity-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100"
			 x-transition:leave-end="opacity-0"
		></div>

		<!-- This element is to trick the browser into centering the modal contents. -->
		<span class="hidden sm:inline-block align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

		<div @mousedown.outside="showPartyModal = false" class="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 align-middle sm:max-w-2xl w-full"
			 v-show="showPartyModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			 x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
		>
		  <div class="bg-white dark:bg-gray-800 px-4 py-5 sm:p-6">
			<div class="sm:flex flex-col sm:items-start w-full">
			  <div class="w-full flex pb-3">
				<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Manage your parties and players</h3>
			  </div>

			  <div class="my-3 sm:mt-0 w-full">
				<div class="my-2 max-h-96 overflow-y-auto scrollbar overflow-x-hidden text-gray-700 dark:text-gray-300">
				  <div v-show="savedParties.length" class="bg-gray-50 dark:bg-gray-700 rounded shadow overflow-hidden border-b dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-800 ">
					<div v-for="(party, partyIndex) of savedParties">

					  <div>
						<div class="flex px-4 py-4 dark:border-gray-700 w-100 relative cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600"
							 :class="{ 'bg-gray-100 hover:bg-gray-50 dark:bg-gray-700': party.editing }"
							 x-tooltip="party.name"
							 :key="partyIndex"
							 @click="party.editing =! party.editing"
						>
						  <div class="grow flex flex-col justify-center mr-2 grow truncate overflow-ellipsis">
							<span v-text="party.name"></span>
						  </div>
						  <div class="shrink-0 grid grid-cols-[30px_1fr] place-items-center h-full absolute inset-y-0 right-0">
							<div class="w-full h-full bg-gradient-to-l from-gray-50 dark:from-gray-700 group-hover:from-gray-100 dark:group-hover:from-gray-600 to-transparent"></div>
							<div class="px-3 bg-gray-50 group-hover:bg-gray-100 dark:bg-gray-700 dark:group-hover:bg-gray-600 min-w-4 h-full grid place-items-center">
							  <div @click.stop="activateParty(partyIndex)" v-show="!party.players.filter((player) => player.active).length" class="h-full hidden place-items-center group-hover:grid text-gray-900 dark:text-gray-100">
								<div>Make all active <i class="fa fa-users"></i></div>
							  </div>
							  <div @click.stop="deactivateParty(partyIndex)" v-show="party.players.filter((player) => player.active).length" class="h-full hidden place-items-center group-hover:grid text-gray-900 dark:text-gray-100">
								<div>Deactivate all <i class="fa fa-users-slash"></i></div>
							  </div>
							</div>
						  </div>
						</div>

						<div v-show="party.editing" class="border-x border-gray-50 dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-x-1 gap-y-2 px-6 py-3">
						  <div class="flex items-center">
							<input v-model="party.name"
								   type="text"
								   class="!mb-0 py-0.5 text-xl"
							>
							<div class="w-[30px] ml-2 flex justify-center">
							  <i @click.stop="deleteParty(partyIndex)" x-tooltip="'Delete ' + party.name" class="fa fa-trash hover:text-red-400 dark:hover:text-red-600 cursor-pointer"></i>
							</div>
						  </div>

						  <div class="text-gray-600 dark:text-gray-300 grid gap-2 grid-cols-[60px_1fr_1fr] md:grid-cols-[60px_1fr_50px_75px_150px_30px]">
							<div>Active</div>
							<div>Name<span class="md:hidden">/Init.</span></div>
							<div>Level<span class="md:hidden">/HP</span></div>
							<div class="hidden md:block md:order-6"></div>
							<div class="hidden md:block">Initiative</div>
							<div class="hidden md:block">HP</div>
						  </div>

						  <div v-for="(player, playerIndex) of party.players">
							<div class="grid gap-2 grid-cols-[60px_1fr_1fr] md:grid-cols-[60px_1fr_50px_75px_150px_30px]">
							  <div class='order-1 flex justify-center md:justify-start'>
								<input type="checkbox" class="hidden" v-model="player.active">

								<button
									@click="player.active = !player.active"
									type="button"
									:class="{'bg-gray-200 dark:bg-gray-700': !player.active, 'bg-emerald-600': player.active}"
									class="bg-gray-200 dark:bg-gray-700 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
									role="switch"
									aria-checked="false"
									aria-labelledby="availability-label"
									aria-describedby="availability-description"
								>
								  <span aria-hidden="true" :class="{'translate-x-0': !player.active, 'translate-x-5': player.active}" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
								</button>
							  </div>


							  <div class="order-2">
								<input type="text" :id="'name_'+playerIndex" v-model="player.name" class="px-1 py-1 !mb-0 block w-full sm:text-sm rounded-md dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300">
							  </div>
							  <div class="order-3">
								<input type="number" :id="'level_'+playerIndex" x-model.number="player.level" class="px-1 py-1 block w-full sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300">
							  </div>

							  <div class="relative order-5 md:order-4 mb-2 md:mb-0">
								<input type="number" :id="'initiativeMod_'+playerIndex" x-model.number="player.initiativeMod" class="pl-1 pr-8 py-1 block w-full sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300">
								<div :class="{ 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-600 dark:hover:text-emerald-700': player.initiativeAdvantage, 'text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400': !player.initiativeAdvantage }" class="text-2xl text-center w-6 cursor-pointer select-none absolute inset-y-0 right-1 flex justify-center items-center" @click="player.initiativeAdvantage =! player.initiativeAdvantage" x-tippy="Advantage on Initiative">
								  <svg xmlns="http://www.w3.org/2000/svg" width="18.5" height="28" viewbox="0 0 173.20508075688772 200" style="fill: currentColor;"><path d="M86.60254037844386 0L173.20508075688772 50L173.20508075688772 150L86.60254037844386 200L0 150L0 50Z"></path></svg>
								</div>
								<div class="pointer-events-none text-lg text-center text-white dark:text-gray-700 font-bold w-6 cursor-pointer select-none absolute inset-y-0 right-1 flex justify-center items-center">
								  A
								</div>
							  </div>

							  <div class="order-6 md:order-5 justify-center md:justify-start flex -space-x-px mb-2 md:mb-0">
								<div class="w-1/2 flex-1 min-w-0">
								  <input min="0" @change="playerChange(player)" @blur="playerChange(player)" type="number" x-model.number="player.currentHp" class="px-1 py-1 text-right border-r-0 relative block w-full rounded-none rounded-l-md sm:text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"/>
								</div>
								<div class="grid place-items-center px-1 shrink rounded-none border border-y-1 bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"> / </div>
								<div class="flex-1 min-w-0">
								  <input min="1" type="number" x-model.number="player.maxHp" class="px-1 py-1 relative border-l-0 block w-full rounded-none rounded-r-md sm:text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"/>
								</div>
							  </div>

							  <div @click="deletePlayer(partyIndex, playerIndex)" class="order-4 md:order-6 group cursor-pointer grid place-items-center mb-2 md:mb-0">
								<i class="fa fa-times text-red-500 dark:text-red-500 group-hover:text-red-600 dark:group-hover:text-red-700"></i>
							  </div>
							</div>
						  </div>

						  <button @click="createPlayer(partyIndex)" type="button" class="button-primary-outline-md col-span-6 justify-center" :class="{ 'h-24': !party.players.length }"> Create player </button>
						  <button v-show="!party.players.length" @click="deleteParty(partyIndex)" type="button" class="button-danger-outline-md col-span-6 justify-center"> Delete Party </button>
						</div>
					  </div>
					</div>
				  </div>
				</div>

				<button v-show="!savedParties.length" @click="createParty" type="button" class="relative block w-full border-2 border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
				  <i class="fa-solid fa-users text-2xl h-12 w-12 mx-auto text-gray-400 dark:text-gray-300"></i>
				  <span class="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200"> Create player party </span>
				</button>
			  </div>
			</div>
		  </div>

		  <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between">
			<button @click="showPartyModal = false" type="button" class="button-primary-md">Close</button>
			<button @click="createParty" type="button" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 dark:bg-emerald-100 dark:bg-transparent dark:text-emerald-500 dark:hover:bg-emerald-800 dark:hover:text-white hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"> <i class="fa fa-plus mr-1"></i> Create party </button>
		  </div>
		</div>
	  </div>
	</div>

	<div v-show="showKeyboardModal" class="fixed z-10 inset-0 overflow-y-auto scrollbar" aria-labelledby="modal-title" role="dialog" aria-modal="true" x-cloak>
	  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity" aria-hidden="true"
			 v-show="showKeyboardModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0"
			 x-transition:enter-end="opacity-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100"
			 x-transition:leave-end="opacity-0"
		></div>

		<!-- This element is to trick the browser into centering the modal contents. -->
		<span class="hidden sm:inline-block align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

		<div @mousedown.outside="showKeyboardModal = false" class="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 align-middle sm:max-w-2xl w-full"
			 v-show="showKeyboardModal"
			 x-transition:enter="ease-out duration-300"
			 x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			 x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave="ease-in duration-200"
			 x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
			 x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
		>
		  <div class="bg-white dark:bg-gray-800 px-4 py-5 sm:p-6">
			<div class="sm:flex flex-col sm:items-start w-full">
			  <div class="w-full flex pb-3">
				<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
			  </div>

			  <div class="my-3 sm:mt-0 w-full">
				<div class="my-2 max-h-96 overflow-y-auto overflow-x-hidden text-gray-700 dark:text-gray-300">
				  <div class="grid grid-cols-2 gap-x-4 gap-y-2">
					<div v-for="shortcut in keyboardHelp">
					  <div class="flex justify-between">
						<kbd class="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-sm font-sans font-medium text-gray-400" v-text="shortcut.key"></kbd>
						<div v-text="shortcut.description"></div>
					  </div>
					</div>
				  </div>
				</div>
			  </div>
			</div>
		  </div>

		  <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between">
			<button @click="showKeyboardModal = false" type="button" class="button-primary-md">Close</button>
		  </div>
		</div>
	  </div>
	</div>

	<ImporterModal />
  <NotificationArea />

  </div>
</template>
