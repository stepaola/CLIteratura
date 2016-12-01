var active = true,
    lessonActual,
    timeElapsed;

//

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
    init = init || false;

    var name;

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
        var lesson = parseInt(lessonActual.name.split("-")[0]);

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
        savedData.lessonActual = parseInt(lessonActual.name.split("-")[0]);
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
        var lessonN = parseInt(lessonActual.name.split("-")[0]),
            entryN = parseInt(entry.name.split("-")[0]);

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
function changePermission (entry, init, cVisible) {
    var term = COMMANDS._terminal;

    cVisible = cVisible || false;
    init = init || false;

    // console.log(entry);
    // console.log(init);
    // console.log(cVisible);
    // console.log(term.getCWD());

    if (!init) {
        console.log("ASd");
        term.write(desbloqueo);
    }
}
