export default class Importer {
    static key = 'AIzaSyASDsLebocDQEHt3-MV_a_tI8r25CHotT4';

    /* import({
    *      resourceLocator = false,
    *      type = 'google-sheets',
    * }={})
    *
    * <- Exact format needed for localStorage
    *
     */
    static async import({
                    resourceLocator = false,
                    type = 'google-sheets'
                  } = {}) {
        let results = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${resourceLocator}/values/Monsters?` + new URLSearchParams({
            key: this.key
        }));
        // HI!
        return results;
    }
}