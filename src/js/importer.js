import * as helpers from './helpers';

export default class Importer {

    static loaders = {
        'google-sheets': this._importGoogleSheets,
        'json-raw': this._importJson,
        'json-file': this._importJsonFile,
        'csv-file': this._importCSV,
    }

    static validators = {
        'google-sheets': this._validateGoogleSheets,
        'json-raw': this._validateJson,
        'json-file': this._validateJsonFile,
        'csv-file': this._validateCSV,
    }

    static exampleFiles = {
        'json-file': this._downloadExampleJson,
        'csv-file': this._downloadExampleCSV,
    }

    static sourcesRequiredHeaders = ["name", "type", "shortname", "link"];
    static monstersRequiredHeaders = ["name", "cr", "size", "type", "tags", "section", "alignment", "environment", "ac", "hp", "init", "lair", "legendary", "unique", "sources"];

    static _validateSources(sources){
        for(let source of sources) {
            for (let key of this.sourcesRequiredHeaders) {
                if (!Object.keys(source).includes(key)) {
                    return [false, `Sources are missing the required header: '${key}' - Please refer to the example files.`];
                }
            }
        }
        return [true];
    }

    static _validateMonsters(monsters){
        for(let monster of monsters) {
            for(let key of this.monstersRequiredHeaders){
                if(!Object.keys(monster).includes(key)){
                    return [false, `Monsters are missing the required header: '${key}' - Please refer to the example files.`];
                }
            }
        }
        return [true];
    }

    static async _validateGoogleSheets(resourceLocator) {
        return await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${resourceLocator}?` + new URLSearchParams({
                key: this.key
            }))
            .then(response => response.json())
            .then(jsonifiedBody => {

                if(jsonifiedBody.error){
                    return [false, `Google responded with an error: "${jsonifiedBody.error.message}" - is your sheet public?`];
                }

                const monsters = jsonifiedBody.sheets.find(sheet => sheet.properties.title === 'Monsters');
                if(!monsters) {
                    return [false, "Your Google Sheets workbook must contain a sheet called 'Monsters'. Only found: '" + (jsonifiedBody.sheets.map(sheet => sheet.properties.title).join(', ')) + "'"];
                }

                const validMonsters = this._validateMonsters(monsters);
                if(!validMonsters[0]){
                    return validMonsters;
                }

                const sources = jsonifiedBody.sheets.find(sheet => sheet.properties.title === 'Sources');
                if(!sources) {
                    return [false, "Your Google Sheets workbook must contain a sheet called 'Sources'. Only found: '" + (jsonifiedBody.sheets.map(sheet => sheet.properties.title).join(', ')) + "'"];
                }

                const validSources = this._validateSources(sources);
                if(!validSources[0]){
                    return validSources;
                }

                return [true, ''];
            });
    }

    static async _validateJson(resourceLocator) {
        let results = await this._importJson(resourceLocator);

        if(!results) {
            return [false, "Couldn't resolve K+FC data, import source is probably invalid JSON."];
        }

        if(!results.sources) {
            return [false, "Your JSON must contain sources."];
        }

        if(!results.monsters) {
            return [false, "Your JSON has sources, but must also contain monsters."];
        }

        const validMonsters = this._validateMonsters(results.monsters);
        if(!validMonsters[0]){
            return validMonsters;
        }

        const validSources = this._validateSources(results.sources);
        if(!validSources[0]){
            return validSources;
        }

        return [true, ""];
    }

    static async _validateJsonFile(resourceLocator) {
        if(resourceLocator.type !== 'application/json') {
            return [false, "The file you provided isn't a text file containing JSON."];
        }

        let results = await this._importJsonFile(resourceLocator);

        if(!results) {
            return [false, "Couldn't resolve K+FC data, import source is probably invalid JSON."];
        }

        if(!results.sources) {
            return [false, "Your JSON must contain sources."];
        }

        if(!results.monsters) {
            return [false, "Your JSON has sources, but must also contain monsters."];
        }

        const validMonsters = this._validateMonsters(results.monsters);
        if(!validMonsters[0]){
            return validMonsters;
        }

        const validSources = this._validateSources(results.sources);
        if(!validSources[0]){
            return validSources;
        }

        return [true, ""];
    }

    static async _validateCSV(resourceLocators) {

        if(!resourceLocators[0] || !resourceLocators[1]){
            return [false, '']
        }

        if(resourceLocators[0].type !== 'text/csv' || resourceLocators[1].type !== 'text/csv') {
            return [false, "The files you provided aren't valid CSV text files."];
        }

        let results = await this._importCSV(resourceLocators);

        if(!results) {
            return [false, "Couldn't resolve K+FC data, import source is probably an invalid CSV file."];
        }

        const validMonsters = this._validateMonsters(results.monsters);
        if(!validMonsters[0]){
            return validMonsters;
        }

        const validSources = this._validateSources(results.sources);
        if(!validSources[0]){
            return validSources;
        }

        return [true, ""];

    }

    static loadersHtml = {
        'google-sheets': () => {
            return `
                <label for="import_resource_locator">Sheets ID</label>
                <input name="import_resource_locator" id="import_resource_locator" type="text" x-model="importerResourceLocator">
            `;
        },
        'json-raw': () => {
            return `
                <label for="import_resource_locator">Raw JSON</label> - <a href="javascript:true" class="primary-link" @click="downloadExampleJson">download example</a>
                <div class="mt-1">
                    <textarea id="import_resource_locator" x-model="importerResourceLocator" rows="4" name="comment" class="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-md lg:rounded-r-none sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600"></textarea>
                </div>
            `;
        },
        'json-file': () => {
            return `
                <label class="block" id="file_input_label" for="import_resource_locator_file">Upload JSON text file below or <a class="primary-link" href="javascript:true" @click="downloadExampleFile">download an example file to edit</a></label>                
                <input accept="application/json" class="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" @change="importerResourceLocator = $event.target.files[0]" aria-describedby="file_input_label" id="import_resource_locator_file" type="file">
            `;
        },
        'csv-file': () => {
            return `
                <label>Upload CSV text files below or <a class="primary-link" href="javascript:true" @click="downloadExampleFile">download example files to edit</a></label>
                <div class="grid grid-cols-2 gap-2 mt-2">                
                    <label class="" id="file_input_label_1" for="import_resource_locator_file_1">Sources CSV</label>                
                    <label class="" id="file_input_label_1" for="import_resource_locator_file_2">Monsters CSV</label>                
                    <input accept="text/csv" class=" text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" @change="if(!Array.isArray(importerResourceLocator)){ importerResourceLocator = [] }; importerResourceLocator[0] = $event.target.files[0]" aria-describedby="file_input_label" id="import_resource_locator_file_1" type="file">
                    <input accept="text/csv" class=" text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" @change="if(!Array.isArray(importerResourceLocator)){ importerResourceLocator = [] }; importerResourceLocator[1] = $event.target.files[0]" aria-describedby="file_input_label" id="import_resource_locator_file_2" type="file">
                </div>
            `;
        },
    }

    static async canImport(resourceLocator, type) {
        if(!resourceLocator) {
            return [false, "You must provide an import source."];
        }

        return this.validators[type].bind(this)(resourceLocator);
    }

    static async import({ resourceLocator = false, type = 'google-sheets' } = {}) {
        return this.loaders[type].bind(this)(resourceLocator);
    }

    static async _importGoogleSheets(resourceLocator) {
        let monsters = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${resourceLocator}/values/Monsters?` + new URLSearchParams({
            key: this.key
        }))
            .then(response => response.json())
            .then(jsonifiedBody => {
                let headers = jsonifiedBody.values.splice(0, 1)[0].map(str => str.toLowerCase());
                return jsonifiedBody.values.map((item) => ({
                    "name": item[headers.indexOf("name")],
                    "cr": item[headers.indexOf("cr")],
                    "size": item[headers.indexOf("size")],
                    "type": item[headers.indexOf("type")],
                    "tags": item[headers.indexOf("tags")],
                    "section": item[headers.indexOf("section")],
                    "alignment": item[headers.indexOf("alignment")].toLowerCase(),
                    "environment": item[headers.indexOf("environment")].toLowerCase(),
                    "ac": item[headers.indexOf("ac")],
                    "hp": item[headers.indexOf("hp")],
                    "init": item[headers.indexOf("init")],
                    "lair": item[headers.indexOf("lair?")] || item[headers.indexOf("lair")],
                    "legendary": item[headers.indexOf("legendary?")] || item[headers.indexOf("legendary")],
                    "unique": item[headers.indexOf("unique?")],
                    "sources": item[headers.indexOf("sources")],
                }));
            })
            .catch(
                err => console.error(err)
            );

        let sources = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${resourceLocator}/values/Sources?` + new URLSearchParams({
            key: this.key
        }))
            .then(response => response.json())
            .then(jsonifiedBody => {
                let headers = jsonifiedBody.values.splice(0, 1)[0].map(str => str.toLowerCase());
                return jsonifiedBody.values.map((item) => ({
                    "name": item[headers.indexOf("name")],
                    "type": item[headers.indexOf("type")],
                    "custom": true,
                    "shortname": item[headers.indexOf("short name")] || item[headers.indexOf("shortname")],
                    "link": item[headers.indexOf("link")],
                    "enabled": true,
                }));
            })
            .catch(
                err => console.error(err)
            );

        return {sources, monsters};
    }

    static async _importJsonFile(resourceLocator) {
        const data = await this._loadFile(resourceLocator);
        return this._importJson(data);
    }

    static async _importJson(resourceLocator) {
        try {
            const data = JSON.parse(resourceLocator);
            for(let source of data.sources){
                source.custom = true;
            }
            return data;
        }catch (err) {
            console.error(err);
            return false;
        }
    }

    static _downloadExampleJson(){

        const jsonExample = {
            "sources": [
                {
                    "name": "Custom Source",
                    "type": "Custom",
                    "shortname": "CS",
                    "link": ""
                },
                {
                    "name": "Another Custom Source",
                    "type": "Third-Party",
                    "shortname": "ACS",
                    "link": "https://google.com/"
                },
            ],
            "monsters": [
                {
                    "name": "Zombie",
                    "cr": "1/4",
                    "size": "Medium",
                    "type": "Undead",
                    "tags": "",
                    "section": "Zombies",
                    "alignment": "neutral evil",
                    "environment": "aquatic, arctic, cave, coast, desert, dungeon, forest, grassland, mountain, ruins, swamp, underground, urban",
                    "ac": 8,
                    "hp": 22,
                    "init": -2,
                    "lair": "",
                    "legendary": "",
                    "unique": "",
                    "sources": "Custom Source: 5"
                },
                {
                    "name": "Bigger Zombie",
                    "cr": "1/2",
                    "size": "Large",
                    "type": "Undead",
                    "tags": "",
                    "section": "Zombies",
                    "alignment": "neutral evil",
                    "environment": "my custom place",
                    "ac": 10,
                    "hp": 41,
                    "init": -2,
                    "lair": "",
                    "legendary": "legendary",
                    "unique": "unique",
                    "sources": "Another Custom Source: 32"
                },
            ]
        };

        helpers.downloadFile("example.json", JSON.stringify(jsonExample, null, 4), "application/json");

    }

    static async _importCSV(resourceLocators){

        const sources = await this._loadFile(resourceLocators[0]);
        if(!sources){
            return false;
        }
        sources.forEach((source) => {
            source.custom = true;
        });

        const monsters = await this._loadFile(resourceLocators[1]);
        if(!monsters){
            return false;
        }

        return {
            sources: this._formatCSV(sources),
            monsters: this._formatCSV(monsters)
        }

    }

    static _formatCSV(str){
        const headers = str.slice(0, str.indexOf("\n")).split(',');
        const rows = str.slice(str.indexOf("\n") + 1).split("\n");
        return rows.map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
        })
    }

    static _downloadExampleCSV(){

        let sources = "name,type,shortname,link\n";
        sources += "Custom Source,Custom,CS,\n"
        sources += "Another Custom Source,Third-Party,ACS,https://google.com/"

        helpers.downloadFile("example_sources.csv", sources, "text/csv");

        let monsters = "name,cr,size,type,tags,section,alignment,environment,ac,hp,init,lair,legendary,unique,sources\n";
        monsters += `Zombie,1/4,Medium,Undead,,Zombies,neutral evil,"aquatic, arctic, cave, coast, desert, dungeon, forest, grassland, mountain, ruins, swamp, underground, urban",8,22, -2,,,,Custom Source: 5\n`
        monsters += `Bigger Zombie,1/2,Large,Undead,,Zombies,neutral evil,my custom place,10,41,-2,,legendary,unique,Another Custom Source: 32`

        helpers.downloadFile("example_monsters.csv", monsters, "text/csv");
    }

    static _loadFile(file){
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', function() {
                try {
                    resolve(reader.result);
                }catch (err) {
                    console.error(err);
                    reject(err);
                }
            });
            reader.readAsText(file);
        });
    }

}