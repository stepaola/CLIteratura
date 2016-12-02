//  Función principal que es llamada desde «main_logic.js»
function lesson01 (init) {
    var total = savedData.tracked.lesson1.length,
        term = COMMANDS._terminal;

    //  Hace llamados según si la función principal se desata al inicio o por el usuario
    function calls (i, call1, call2) {
        //  Si es por el usuario, se busca ir a la carpeta deseada
        if (!init) {
            ml.dirSend(term.cwd, term.getEntryIndx(1, i, true), function () {
                //  Se hace el llamado hasta que se vaya o se evite ir a la carpeta
                call1; call2;
            });
        //  Si es al inicio, solo hace los llamados
        } else {
            call1; call2;
        }
    }

    //  Va a desaparecer los textos 1-5 y mostrar el 6
    if (total == 5)
        ml.changePermissionsIndx(1, 1, 6, false);
    //  Va a desaparecer el texto 6, mostrar del 7-11 y bloquear la carpeta pasillo_fondo, yendo a puerta_roble
    else if (total == 6)
        calls(4, ml.changePermissionsIndx(1, 6, 11, false), ml.changePermission(term.getEntryIndx(1, 1, true), true));
    //  Va a desaparecer los textos 7-11 y mostrar el 12
    else if (total == 11)
        ml.changePermissionsIndx(1, 7, 12, false);
    //  Va a ocultar el texto 12 y mostrar el 13
    else if (total == 12)
        ml.changePermissionsIndx(1, 12, 13, false);
    //  Va a ocultar el texto 13, mostrar el 14 y bloquear el living, yendo a puerta_cancel
    else if (total == 13)
        calls(3, ml.changePermissionsIndx(1, 13, 14, false), ml.changePermission(term.getEntryIndx(1, 2, true), true));
    //  Va a ocultar el texto 14, mostrar el 15 y bloquear la puerta_cancel, yendo a zaguan
    else if (total == 14)
        calls(5,  ml.changePermissionsIndx(1, 14, 15, false), ml.changePermission(term.getEntryIndx(1, 3, true), true));
    //  Va a desocultar todo e ir a zaguan
    else if (total == 15)
        calls(5,  ml.changePermissionsIndx(1, 1, 15, false, true, true), ml.changePermissionsIndx(1, 1, 3, true, true, true));

    //  Escribe texto de desbloqueo de eventos o de fin de la lección
    if (total == 5 || total == 6 || (total >= 11 && total <= 14))
        term.write(loc.ale(aux.unlocked));
    else if (total == 15)
        term.write(loc.ale(aux.finished));
}
