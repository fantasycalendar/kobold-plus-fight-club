export default class Importer {

    static loaders = {
        'google-sheets': this._importGoogleSheets,
        'json-raw': this._importJson,
        'json-file': this._importJsonFile,
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
                <label for="import_resource_locator">Raw JSON</label> - <a href="javascript:true" @click="downloadExampleJson">download example</a>
                <div class="mt-1">
                    <textarea id="import_resource_locator" x-model="importerResourceLocator" rows="4" name="comment" class="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-md lg:rounded-r-none sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600"></textarea>
                </div>
            `;
        },
        'json-file': () => {
            return `
                <label for="import_resource_locator" class="block mb-2 text-gray-900 dark:text-gray-300">Upload JSON file</label> - <a href="javascript:true" @click="downloadExampleJson">download example</a>
                <input id="import_resource_locator" type="file" accept="text/json" @change="importerResourceLocator = $event.target.files[0]" class="block w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400">
            `;
        },
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
                let headers = jsonifiedBody.values.splice(0, 1)[0];

                return jsonifiedBody.values.map((item) => ({
                    "name": item[headers.indexOf("name")],
                    "cr": item[headers.indexOf("cr")],
                    "size": item[headers.indexOf("size")],
                    "type": item[headers.indexOf("type")],
                    "tags": item[headers.indexOf("tags")],
                    "section": item[headers.indexOf("section")],
                    "alignment": item[headers.indexOf("alignment")],
                    "environment": item[headers.indexOf("environment")],
                    "ac": item[headers.indexOf("ac")],
                    "hp": item[headers.indexOf("hp")],
                    "init": item[headers.indexOf("init")],
                    "lair": item[headers.indexOf("lair?")],
                    "legendary": item[headers.indexOf("legendary?")],
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
                let headers = jsonifiedBody.values.splice(0, 1)[0];

                return jsonifiedBody.values.map((item) => ({
                    "name": item[headers.indexOf("name")],
                    "type": 'Custom',
                    "shortname": item[headers.indexOf("short name")],
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
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', function() {
                try {
                    const data = JSON.parse(reader.result);
                    resolve(data);
                }catch (err) {
                    console.error(err);
                    reject(err);
                }
            });
            reader.readAsText(resourceLocator);
        });
    }

    static async _importJson(resourceLocator) {
        try {
            return JSON.parse(resourceLocator);
        }catch (err) {
            console.error(err);
            return false;
        }
    }


    static downloadExampleJson(){

        const jsonExample = {
            "sources": [
                {
                    "name": "Custom Source",
                    "shortname": "CS",
                    "link": ""
                },
                {
                    "name": "Another Custom Source",
                    "shortname": "ACS",
                    "link": ""
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
                    "lair?": "",
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
                    "lair?": "",
                    "legendary": "legendary",
                    "unique": "unique",
                    "sources": "Another Custom Source: 32"
                },
            ]
        };

        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(jsonExample, null, 4)], { type: "text/json" });
        a.href = URL.createObjectURL(file);
        a.download = "example.json";
        a.click();
        a.remove();

    }

}