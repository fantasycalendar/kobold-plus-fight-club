require('@fortawesome/fontawesome-free');

import Choices from 'choices.js';
import hotkeys from 'hotkeys-js';
import encounter from "./encounter";
import * as helpers from "./helpers";
import CONST from "./constants";
import Monster from "./monster";
import Importer from "./importer";

import tippy from 'tippy.js';
import noUiSlider from "nouislider";

import persist from '@alpinejs/persist'
import Alpine from 'alpinejs'

const internationalNumberFormat = new Intl.NumberFormat('en-US')

function app() {

    return {

        sourcesVersion: "2.2.0",
        storedSourcesVersion: Alpine.$persist("2.0.0").as('storedSourcesVersion'),

        menu: false,
        showFilters: false,
        showSourcesModal: false,
        showEncounterModal: false,
        showPartyModal: false,
        showKeyboardModal: false,
        showImporterModal: false,

        hasShownCustomMonstersNotification: Alpine.$persist(false).as('hasShownCustomMonstersNotification'),

        mobileEncounterTab: false,

        filters: {},
        searchPlaceholder: "",
        nonDefaultFiltersCount: 0,

        loadedSources: Alpine.$persist([]).as('sources'),
        importedSources: Alpine.$persist([]).as('importedSources'),
        loadedMonsters: Alpine.$persist([]).as('monsters'),
        importedMonsters: Alpine.$persist([]).as('importedMonsters'),

        encounterHistory: Alpine.$persist([]).as('encounterHistory'),
        savedEncounters: Alpine.$persist([]).as('savedEncounters'),

        loadedEncounterIndex: Alpine.$persist(null).as('loadedEncounterIndex'),
        loadedLastEncounter: Alpine.$persist(false).as('loadedLastEncounter'),

        savedParties: Alpine.$persist([]).as('savedParties'),

        sources: {},
        enabledSources: [],

        allMonsters: [],
        filteredMonsters: [],
        monsterLookupTable: {},

        environments: {},

        totalPages: 1,
        currentPage: Alpine.$persist(1).as('currentPage'),
        pagination: [],
        monstersPerPage: Alpine.$persist(10).as("monstersPerPage"),

        encounterType: Alpine.$persist("random").as("encounterType"),
        encounterTypeSelectOpen: false,
        encounterTypes: Object.fromEntries(Object.entries(CONST.ENCOUNTER_TYPES).map(entry => {
            return [entry[0], { key: entry[0], label: entry[1].name }];
        })),

        difficultySelectOpen: false,
        difficulty: Alpine.$persist("medium").as("difficulty"),
        search: Alpine.$persist("").as("search"),

        encounter: encounter,

        sortBy: Alpine.$persist("name").as("sortBy"),
        sortByDesc: Alpine.$persist(true).as("sortByDesc"),

        setSortBy(type){
            if(type === this.sortBy){
                this.sortByDesc = !this.sortByDesc;
            }else{
                this.sortByDesc = true;
            }
            this.sortBy = type;
            this.updateFilteredMonsters();
        },

        theme: window.theme,

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

        get activePlayers(){
            return this.savedParties.reduce((acc, party) => {
                return acc.concat(party.players.filter(player => player.active));
            }, []);
        },

        party: {

            groups: Alpine.$persist([{ players: 4, level: 1, getsXP: true }]).as("groups"),

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

            get totalPlayers() {
                return this.groups.reduce((acc, group) => {
                    return acc + parseInt(group.players)
                }, 0) + this.app.activePlayers.length;
            },

            get totalPlayersToGainXP(){
                return this.groups.reduce((acc, group) => {
                    return acc + (group.getsXP ? parseInt(group.players) : 0)
                }, 0) + this.app.activePlayers.length;
            },

            get totalExperiencePerPlayer(){
                return Math.round(this.app.encounter.totalExp / this.totalPlayersToGainXP);
            },

            get totalAdjustedExperiencePerPlayer(){
                return Math.round(this.app.encounter.adjustedExp / this.totalPlayersToGainXP);
            },

        },

        init(){
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

            if(!this.hasShownCustomMonstersNotification){
                setTimeout(() => {
                    dispatchEvent(new CustomEvent('notification', {
                        detail: {
                            title: 'Custom Monsters have arrived!',
                            body: 'Add more creatures to challenge your players - click on the "Import Custom Monsters" in the top bar to get started!',
                            icon: 'fa-skull text-4xl',
                            icon_color: 'text-emerald-600',
                            sticky: true,
                            callback: () => {
                                this.hasShownCustomMonstersNotification = true;
                            }
                        }
                    }));
                }, 1000)
            }
        },

        get monsters(){
            const currentPage = this.currentPage-1;
            const start = !currentPage ? 0 : (currentPage*this.monstersPerPage)+1;
            const end = !currentPage ? this.monstersPerPage : ((currentPage+1)*this.monstersPerPage)+1
            return this.filteredMonsters.slice(start, end);
        },

        get sourcesByType(){
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
        },

        async fetchData() {
            this.formatSources(await this.fetchSources());
            this.formatSources(this.importedSources);

            this.formatMonsters(await this.fetchMonsters());
            this.formatMonsters(this.importedMonsters);

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

            if(this.loadedSources.length && helpers.versionCompare(this.sourcesVersion, this.storedSourcesVersion) === 0){
                return this.loadedSources;
            }

            let sources = [];

            await fetch("json/se_sources.json")
                .then(res => res.json())
                .then((data) => {
                    sources = sources.concat(data);
                });

            await fetch("json/se_third_party_sources.json")
                .then(res => res.json())
                .then((data) => {
                    sources = sources.concat(data);
                });

            await fetch("json/se_community_sources.json")
                .then(res => res.json())
                .then((data) => {
                    sources = sources.concat(data);
                });

            // This causes old sources that were enabled to remain enabled
            if(this.loadedSources.length){
                sources.map((newSource) => {
                    const foundOldSource = this.loadedSources.find(oldSource => {
                        return newSource['name'] === oldSource["name"];
                    });
                    if(foundOldSource){
                        newSource.enabled = foundOldSource.enabled;
                    }else{
                        newSource.enabled = !!newSource.default;
                    }
                })
            }else{
                this.loadedSources = sources.map(source => {
                    source.enabled = !!source.default;
                    return source;
                });
            }

            return this.loadedSources;

        },

        async fetchMonsters(){

            if(this.loadedSources.length && helpers.versionCompare(this.storedSourcesVersion, this.sourcesVersion) === 0){
                return this.loadedMonsters;
            }

            let monsters = [];

            await fetch("json/se_monsters.json")
                .then(res => res.json())
                .then((data) => {
                    monsters = monsters.concat(data);
                });

            await fetch("json/se_third_party_monsters.json")
                .then(res => res.json())
                .then((data) => {
                    monsters = monsters.concat(data);
                });

            await fetch("json/se_community_monsters.json")
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
            }, this.sources);
        },

        formatMonsters(data){
            const newMonsters = data.map(data => {
                const monster = new Monster(this, data);
                if(this.monsterLookupTable[monster.slug]){
                    return false;
                }
                this.monsterLookupTable[monster.slug] = monster;
                return monster;
            }).filter(Boolean);

            this.allMonsters = this.allMonsters.concat(newMonsters);

            let environments = {};
            let creatureTypes = new Set();
            let creatureSizes = new Set();
            this.allMonsters.forEach(monster => {
                monster.environments.split(',').forEach(environment => {
                    if(environment && !environments[environment]){
                        let label = environment = environment.trim();
                        label = label.slice(0,1).toUpperCase() + label.slice(1);
                        environments[environment] = {
                            value: environment,
                            label: label
                        }
                    }
                });

                creatureTypes.add(monster.data.type)
                creatureSizes.add(monster.data.size)
            });

            environments = Object.values(environments);
            environments.sort((a, b) => {
                return a.value > b.label ? -1 : 1;
            });
            environments.unshift({ value: "any", label: "Any Environment" });
            window.dispatchEvent(new CustomEvent('set-environments', { detail: environments }));

            creatureTypes = Array.from(creatureTypes)
            creatureTypes.sort();
            creatureTypes = creatureTypes.map(type => ({
                label: type,
                value: type.toLowerCase(),
            }));
            creatureTypes.unshift({ value: "any", label: "Any Type" });
            window.dispatchEvent(new CustomEvent('set-creature-types', { detail: creatureTypes }));
        },

        deleteImportedSource(sourceName){

            const sourceToDelete = this.sources[sourceName];

            this.allMonsters = this.allMonsters.filter(monster => {
                return !monster.sources.find(source => source.actual_source === sourceToDelete);
            });

            this.importedMonsters = this.importedMonsters.filter(monster => {
                return !monster.sources.startsWith(sourceName);
            });

            delete this.sources[sourceName];
            const index = this.importedSources.findIndex(source => source.name === sourceName);
            this.importedSources.splice(index, 1);

            this.updateFilteredMonsters();

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

        timer: null,
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
            form.parentNode.removeChild(form);

        }
    }
}

function multiSlider($el, name, options, updateCallback) {
    return {
        slider: {},
        originals: {
            min: '0',
            max: '30',
        },
        options: options,
        value: Alpine.$persist({min: '0', max: '30'}).as(name),
        init() {
            this.slider = noUiSlider.create($el, {
                start: [options.findIndex((option) => option.value === this.value.min), options.findIndex((option) => option.value === this.value.max)],
                connect: true,
                range: {
                    'min': 0,
                    'max': options.length - 1
                },
                step: 1
            });

            this.slider.on('update', (values) => updateCallback(this.options[parseInt(values[0])], this.options[parseInt(values[1])]));
            this.slider.on('change', (values) => {
                this.value = {
                    min: this.options[parseInt(values[0])].value,
                    max: this.options[parseInt(values[1])].value
                };

                this.onFiltersChanged();
            });

            this.onFiltersChanged();
        },
        onFiltersChanged() {
            window.dispatchEvent(new CustomEvent('filters-changed', { detail: {
                    name: "cr",
                    value: {
                        min: CONST.CR[this.value.min].numeric,
                        max: CONST.CR[this.value.max].numeric
                    }
                }}))
        },
        reset() {
            this.value = JSON.parse(JSON.stringify(this.originals));
            this.slider.set([0, this.options.length - 1]);

            this.onFiltersChanged();
        },
        set($event) {
            let newSetting = [
                options.findIndex((option) => option.value === $event.detail[0].value),
                options.findIndex((option) => option.value === $event.detail[1].value)
            ];

            if(newSetting[0] < 0) {
                newSetting[0] = 0;
            }
            if(newSetting[1] < 0) {
                newSetting[1] = this.options.length - 1;
            }

            this.slider.set(newSetting);

            this.value = {
                min: $event.detail[0].value,
                max: $event.detail[1].value
            };

            this.onFiltersChanged();
        }
    }
}

function multiSelect($el, name, options) {
    return {
        multiple: true,
        value: Alpine.$persist(['any']).as(name),
        name: name,
        options: options,
        completedSetup: false,
        init() {
            if(!options.length) return;
            this.$nextTick(() => {
                this.setUp();
            })
        },
        setUp(){
            if(this.completedSetup) {
                return;
            }

            let choices = new Choices($el, {
                allowHTML: true,
                removeItemButton: true
            })

            let refreshChoices = () => {
                let selection = this.multiple ? this.value : [this.value]

                choices.clearStore()
                choices.setChoices(this.options.map(({ value, label }) => ({
                    value,
                    label,
                    selected: selection.includes(value),
                })))

                this.onFiltersChanged();
            }

            refreshChoices()

            $el.addEventListener('change', () => {
                this.value = choices.getValue(true);

                if(this.value.length > 1 && this.value.includes('any')) {
                    this.value = this.value.filter(value => value !== 'any');
                }

                if(this.multiple && !this.value.length) {
                    this.value = ['any'];
                }

                this.onFiltersChanged();
            })

            this.$watch('value', () => refreshChoices())
            this.$watch('options', () => refreshChoices())

            this.onFiltersChanged();

            this.completedSetup = true;
        },
        onFiltersChanged() {
            window.dispatchEvent(new CustomEvent('filters-changed', { detail: {
                name: this.name,
                asArray: true,
                value: this.value
            }}))
        },
        reset(){
            this.value = ['any'];
            this.onFiltersChanged();
        }
    }
}

window.hotkeys = hotkeys;
window.app = app;
window.multiSelect = multiSelect;
window.multiSlider = multiSlider;
window.noUiSlider = noUiSlider;
window.Choices = Choices;
window.tippy = tippy;
window.Importer = Importer;

window.Alpine = Alpine

Alpine.plugin(persist)
Alpine.start()