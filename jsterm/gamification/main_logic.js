var active = true,
    lessonActual,
    timeElapsed;

//  Para detectar si se está en la ventana o no
window.addEventListener("focus", focus);
window.addEventListener("blur", blur);

//  Para estipular que la ventana está activa
function focus () {
    active = true;
}

//  Para estipular que la ventana no está activa
function blur () {
    active = false;
}

//  Llama a la lógica particular de la lección
function particularFunction (i, init) {
    var name;

    /*
        Es grotesco que ese «init» se herede en varias funciones solo para
        denotar cuándo es un restablecimiento de cambios después de una restauración
        y cuándo es un nuevo cambio.
    */

    //  Falso si no se estipuló
    init = init || false;

    //  Se agrega un cero si es menor a 10
    if (i < 10)
        name = "lesson0" + i;
    else
        name = "lesson" + i;

    //  Se llama a la función
    window[name](init);
}

//  Guarda la fecha
function saveDate () {
    var d = new Date(),
        second = d.getSeconds(),
        minute = d.getMinutes(),
        hour = d.getHours(),
        day = d.getDate(),
        month = d.getMonth() + 1,
        year = d.getFullYear(),
        dayWeek = d.getDay()
        date = {};

    date.second = second;
    date.minute = minute;
    date.hour = hour;
    date.day = day;
    date.month = month;
    date.year = year;
    date.dayWeek = dayWeek;

    savedData.date = date;
    localStorage.date = JSON.stringify(savedData.date);
}

//  Inicia un conteo para medir cuánto tiempo se pasa en una lección
function timer () {
    //  Se suma tiempo solo si la ventana está activa
    if (active) {
        var lesson = parseInt(lessonActual.name);

        //  Si nunca se ha tomado el tiempo
        if (savedData.times == undefined || savedData.times["lesson" + lesson] == undefined) {
            //  Si no existe ningún registro de tiempo, se crea
            if (savedData.times == undefined)
                savedData.times = {};

            //  Se añade el primer segundo transcurrido en la lección
            savedData.times["lesson" + lesson] = 1;
            localStorage.times = JSON.stringify(savedData.times);
            saveDate();
        }
        //  Si ya se había tomado el tiempo
        else {
            //  Se añade el tiempo transcurrido en la lección
            savedData.times["lesson" + lesson] = savedData.times["lesson" + lesson] + 1;
            localStorage.times = JSON.stringify(savedData.times);
            saveDate();
        }
    }
}

//  Detiene el conteo
function timerStop () {
    //  Solo es efectivo si el timer existe
    if (timeElapsed != null) {
        //  Limpia el intervalo
        clearInterval(timeElapsed);
    }
}

//  Cambia la lección actual
function lessonChange (entry) {
    //  Si es falso, quiere decir que está en el direcotio inicial, por lo que no hay lección
    if (entry == false) {
        lessonActual = null;

        //  Remueve la lección actual
        delete savedData.lessonActual;
        localStorage.removeItem("lessonActual");
        saveDate();
    }
    else {
        lessonActual = entry;

        //  Guarda el cambio
        savedData.lessonActual = parseInt(lessonActual.name);
        localStorage.lessonActual = savedData.lessonActual;
        saveDate();
    }

}

//  Rastrea carpetas
function dirTracking (entry) {
    var term = COMMANDS._terminal,
        dirStr = term.dirString(entry),
        dirs = dirStr.split("/"),
        dirPath = "";

    //  Guarda la ubicación actual
    savedData.path = dirStr;
    localStorage.path = savedData.path;
    saveDate();

    //  Busca la lección en la que se encuentra
    dirs.forEach(function (dir) {
        var e = term.getEntry(dirPath + dir);

        //  Si en la ruta al directorio existe un fichero padre que es una lección, se estipula como la lección actual
        if (e.lesson == true && lessonActual != e) {
            lessonChange(e);

            //  Detiene el conteo y lo vuelve a iniciar ya que se está en otra lección
            timerStop();
            timeElapsed = setInterval(timer, 1000);
        }
        //  Si en la ruta al directorio lleva al directorio de inicio, se termina el rastreo
        else if (e.name == "~" && dirs.length == 1) {
            //  Detiene el conteo porque ya no se está en ninguna lección
            timerStop();

            //  Estipula que no hay lección actual
            lessonChange(false);
        }

        dirPath += dir + "/";
    });
}

//  Rastrea archivos
function fileTracking (entry) {

    //  Va guardando el avance del usuario a través de las lecciones si es posible comparar
    if (lessonActual != null && entry.track != undefined) {
        var lessonN = parseInt(lessonActual.name),
            entryN = parseInt(entry.name);

        //  La comparación reside en que el archivo tiene que abrirse adentro de la lección en curso, para evitar falsos positivos o trampa
        if (entry.track == lessonN) {
            //  Si nunca había rastreado
            if (savedData.tracked == undefined || savedData.tracked["lesson" + lessonN] == undefined) {
                //  Si no existe ningún registro de rastreo, se crea
                if (savedData.tracked == undefined)
                    savedData.tracked = {};

                //  Se añade el primer elemento rastreado de la lección
                savedData.tracked["lesson" + lessonN] = [entryN];
                localStorage.tracked = JSON.stringify(savedData.tracked);
                saveDate();

                //  Llama a la lógica particular de la lección
                particularFunction(lessonN);
            }
            //  Si ya había rastreado
            else {
                var repeated = false;

                //  Busca si ya existe
                for (var i = 0; i < savedData.tracked["lesson" + lessonN].length; i++)
                    if (l = savedData.tracked["lesson" + lessonN][i] == entryN) {
                        repeated = true;
                        break;
                    }

                //  Se añade el elemento rastredo de la lección si no está repetido
                if (!repeated) {
                    savedData.tracked["lesson" + lessonN].push(entryN);
                    savedData.tracked["lesson" + lessonN].sort();
                    localStorage.tracked = JSON.stringify(savedData.tracked);
                    saveDate();

                    //  Llama a la lógica particular de la lección
                    particularFunction(lessonN);
                }
            }
        }
    }
}

//  Cambia permisos
function changePermission (entry, init, cVisible, cPermission) {
    var term = COMMANDS._terminal;

    //  Establece el valor de las variables según si se estipularon o no
    cPermission = cPermission === undefined ? null : cPermission;
    cVisible = cVisible === undefined ? null : cVisible;
    init = init || false;

    //  Función para el cambio
    function change (bool) {
        var val = bool == entry.visible ? cVisible : cPermission;

        //  Si la variable no fue estipulada
        if (val == null) {
            //  Si la llave no existe, se estipula falsa, ya que por defecto es verdadera
            if (bool === undefined)
                bool = false;
            //  Si la llave existe, se cambia su valor
            else
                bool = !bool;
        }
        //  Si la variable fue estipulada, ese valor se inserta
        else
            bool = val;

        //  Da el nuevo valor
        return bool;
    }

    //  Realiza los cambios según la llave
    entry.visible = change(entry.visible);
    entry.permission = change(entry.permission);

    //  Se muestra el texto de desbloqueo si no se trata de una función al restaurar la sesión
    if (!init) {
        term.write(desbloqueo);
    }
}

//  Cambia permisos de varios ficheros
function changePermissions (array, init) {

    /*
        Sistematiza la puesta de cambios de varios archivos, si seguimos el siguiente ejemplo:
            changePermissions([[term.getEntryIndx(6)], [term.getEntryIndx(1, true), true], [term.getEntryIndx(1, true), false, true]], init);
        el array es:
            [[term.getEntryIndx(6)], [term.getEntryIndx(1, true), true], [term.getEntryIndx(1, true), false, true]]
        donde
            term.getEntryIndx(i) obtiene un archivo o
            term.getEntryIndx(i, bool) adquiere una carpeta según su índice,
        y donde cada cada elemento manda a llamar:
            1. [term.getEntryIndx(6)] = changePermission(archivo, init);
            2. [term.getEntryIndx(1, true), true] = changePermission(carpeta, init, true);
            3. [term.getEntryIndx(1, true), false, true]] = changePermission(carpeta, init, false true);
    */

    //  Itera cada uno de los elementos del conjunto que son igual a cada entrada a cambiar y sus opciones
    for (var i = 0; i < array.length; i++)
        switch (array[i].length) {
            //  Si hubo una opción, será un «changePermission(entry, init, cVisible)»
            case 2:
                changePermission(array[i][0], init, array[i][1]);
                break;
            //  Si hubo dos opciones, será un «changePermission(entry, init, cVisible, cPermission)»
            case 3:
                changePermission(array[i][0], init, array[i][1], array[i][2]);
                break;
            //  Si no hubo opciones, será un «changePermission(entry, init)»
            default:
                changePermission(array[i][0], init);
        }
}
