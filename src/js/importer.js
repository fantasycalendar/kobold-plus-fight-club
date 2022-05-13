export default class Importer {
    

    static loaders = {
        'google-sheets': this._importGoogleSheets,
        'json-raw': this._importJson,
        'json-file': this._importJsonFile,
    }

    /* import({
    *      resourceLocator = false,
    *      type = 'google-sheets',
    * }={})
    *
    * <- Exact format needed for localStorage
    *
     */
    static async import({ resourceLocator = false, type = 'google-sheets' } = {}) {
        return this.loaders[type](resourceLocator);
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

}