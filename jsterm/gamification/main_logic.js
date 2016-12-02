var active = true,
    lessonActual,
    timeElapsed;

//  Para detectar si se está en la ventana o no
window.addEventListener("ml.focus", focus);
window.addEventListener("ml.blur", blur);

var ml = {
    //  Para usar las funciones de jsterm
    term: COMMANDS._terminal,

    //  Para estipular que la ventana está activa
    focus: function () {
        active = true;
    },

    //  Para estipular que la ventana no está activa
    blur: function () {
        active = false;
    },

    //  Llama a la lógica particular de la lección
    particularFunction: function (i) {
        var name;

        //  Se agrega un cero si es menor a 10
        if (i < 10)
            name = "lesson0" + i;
        else
            name = "lesson" + i;

        //  Se llama a la función
        window[name]();
    },

    //  Guarda la fecha
    saveDate: function () {
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
    },

    //  Inicia un conteo para medir cuánto tiempo se pasa en una lección
    timer: function () {
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
                ml.saveDate();
            }
            //  Si ya se había tomado el tiempo
            else {
                //  Se añade el tiempo transcurrido en la lección
                savedData.times["lesson" + lesson] = savedData.times["lesson" + lesson] + 1;
                localStorage.times = JSON.stringify(savedData.times);
                ml.saveDate();
            }
        }
    },

    //  Detiene el conteo
    timerStop: function () {
        //  Solo es efectivo si el timer existe
        if (timeElapsed != null) {
            //  Limpia el intervalo
            clearInterval(timeElapsed);
        }
    },

    //  Cambia la lección actual
    lessonChange: function (entry) {
        //  Si es falso, quiere decir que está en el direcotio inicial, por lo que no hay lección
        if (entry == false) {
            lessonActual = null;

            //  Remueve la lección actual
            delete savedData.lessonActual;
            localStorage.removeItem("lessonActual");
            ml.saveDate();
        }
        else {
            lessonActual = entry;

            //  Guarda el cambio
            savedData.lessonActual = parseInt(lessonActual.name);
            localStorage.lessonActual = savedData.lessonActual;
            ml.saveDate();
        }

    },

    //  Manda a un directorio especificado
    dirSend: function (origin, destination, callback) {
        //  Espera un cuarto de segundo para evitar errores de escritura
        setTimeout(function () {
            //  Si no se está usando la terminal
            if (!wait) {
                //  Si la carpeta de origin no es la de destino
                if (origin != destination) {
                    //  Se hace cd con la ruta absoluta y se añade el callback
                    var path = ml.term.dirString(destination);
                    ml.term.typeCommand("cd " + path, callback);
                //  Si es la misma, solo ejecuta el callback si lo hay
                } else
                    if (callback)
                        callback();
            //  Si se está usando la terminal, espera medio segundo para volver a llamar
            } else {
                ml.dirSend(origin, destination, callback);
            }
        }, 250);
    },

    //  Rastrea carpetas
    dirTracking: function (entry) {
        var dirStr = ml.term.dirString(entry),
            dirs = dirStr.split("/"),
            dirPath = "";

        //  Guarda la ubicación actual
        savedData.path = dirStr;
        localStorage.path = savedData.path;
        ml.saveDate();

        //  Busca la lección en la que se encuentra
        dirs.forEach(function (dir) {
            var e = ml.term.getEntry(dirPath + dir);

            //  Si en la ruta al directorio existe un fichero padre que es una lección, se estipula como la lección actual
            if (e.lesson == true && lessonActual != e) {
                ml.lessonChange(e);

                //  Detiene el conteo y lo vuelve a iniciar ya que se está en otra lección
                ml.timerStop();
                timeElapsed = setInterval(ml.timer, 1000);
            }
            //  Si en la ruta al directorio lleva al directorio de inicio, se termina el rastreo
            else if (e.name == "~" && dirs.length == 1) {
                //  Detiene el conteo porque ya no se está en ninguna lección
                ml.timerStop();

                //  Estipula que no hay lección actual
                ml.lessonChange(false);
            }

            dirPath += dir + "/";
        });
    },

    //  Rastrea archivos
    fileTracking: function (entry) {

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
                    ml.saveDate();

                    //  Llama a la lógica particular de la lección
                    ml.particularFunction(lessonN);
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
                        ml.saveDate();

                        //  Llama a la lógica particular de la lección
                        ml.particularFunction(lessonN);
                    }
                }
            }
        }
    },

    //  Cambia permisos
    changePermission: function (entry, cVisible, cPermission) {
        //  Establece el valor de las variables según si se estipularon o no
        cPermission = cPermission === undefined ? null : cPermission;
        cVisible = cVisible === undefined ? null : cVisible;

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
    },

    //  Cambia permisos de varios ficheros
    changePermissions: function (array) {

        /*
            Sistematiza la puesta de cambios de varios archivos, si seguimos el siguiente ejemplo:
                changePermissions([[terminal.getEntryIndx(6)], [terminal.getEntryIndx(1, true), true], [terminal.getEntryIndx(1, true), false, true]]);
            el array es:
                [[terminal.getEntryIndx(6)], [terminal.getEntryIndx(1, true), true], [terminal.getEntryIndx(1, true), false, true]]
            donde
                terminal.getEntryIndx(i) obtiene un archivo o
                terminal.getEntryIndx(i, bool) adquiere una carpeta según su índice,
            y donde cada cada elemento manda a llamar:
                1. [terminal.getEntryIndx(6)] = changePermission(archivo);
                2. [terminal.getEntryIndx(1, true), true] = changePermission(carpeta, true);
                3. [terminal.getEntryIndx(1, true), false, true]] = changePermission(carpeta, false true);
        */

        //  Itera cada uno de los elementos del conjunto que son igual a cada entrada a cambiar y sus opciones
        for (var i = 0; i < array.length; i++)
            switch (array[i].length) {
                //  Si hubo una opción, será un «changePermission(entry, cVisible)»
                case 2:
                    ml.changePermission(array[i][0], array[i][1]);
                    break;
                //  Si hubo dos opciones, será un «changePermission(entry, cVisible, cPermission)»
                case 3:
                    ml.changePermission(array[i][0], array[i][1], array[i][2]);
                    break;
                //  Si no hubo opciones, será un «changePermission(entry)»
                default:
                    ml.changePermission(array[i][0]);
            }
    },

    //  Limpia los datos
    clear: function () {
        //  Si no se está en el directorio de inicio
        if (localStorage.path != "~") {
            //  Manda al directorio de inicio para evitar que se grave el timer
            ml.term.typeCommand("cd ~", function () {
                //  Cuando termina, ejecuta el refrescar
                ml.refresh();
            });
        }
        else
            ml.refresh();
    },

    //  Refresca la ventana
    refresh: function () {
        //  Limpia los datos locales
        localStorage.clear();

        //  Refresca la ventana
        location.reload();
    }
}
