var loc = {
    //  Localiza el contenido
    ale: function (entry, str) {
        var lang = navigator.language.split("-")[0],
            key = str || "contents";

        /*
            Por defecto el lenguaje es en español, cuya llave siempre tiene que ir sin coletilla,
            si el SO está usando otro idioma, buscará la llave con la coletilla «_lang» donde «lang»
            es el elemento antes del guion de lo que arroja navigator.language.

            Por ejemplo:
                navigator.language = en-US
                lang = en
                => entry.key_en || entry.key si no existe la traducción
        */

        if (entry[key + "_" + lang] !== undefined)
            return entry[key + "_" + lang];
        else
            return entry[key];
    }
}
