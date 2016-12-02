//  Función principal que es llamada desde «main_logic.js»
function lesson01 () {
    var total = savedData.tracked.lesson1.length,
        term = COMMANDS._terminal;

    //  Va a desaparecer los textos 1-5 y mostrar el 6
    if (total == 5) {
        term.write(desbloqueo);
        ml.changePermissions([
            [term.getEntryIndx(1, 1)],
            [term.getEntryIndx(1, 2)],
            [term.getEntryIndx(1, 3)],
            [term.getEntryIndx(1, 4)],
            [term.getEntryIndx(1, 5)],
            [term.getEntryIndx(1, 6)]]);
    }
    //  Va a desaparecer el texto 6, mostrar del 7-11 y bloquear la carpeta pasillo_fondo
    else if (total == 6) {
        term.write(desbloqueo);
        //  Va a puerta_roble si no está ahí
        ml.dirSend(term.cwd, term.getEntryIndx(1, 4, true), function () {
            ml.changePermissions([
                [term.getEntryIndx(1, 6)],
                [term.getEntryIndx(1, 7)],
                [term.getEntryIndx(1, 8)],
                [term.getEntryIndx(1, 9)],
                [term.getEntryIndx(1, 10)],
                [term.getEntryIndx(1, 11)],
                [term.getEntryIndx(1, 1, true), true]]);
        });
    }
    //  Va a desaparecer los textos 7-11 y mostrar el 12
    else if (total == 11) {
        term.write(desbloqueo);
        ml.changePermissions([
            [term.getEntryIndx(1, 7)],
            [term.getEntryIndx(1, 8)],
            [term.getEntryIndx(1, 9)],
            [term.getEntryIndx(1, 10)],
            [term.getEntryIndx(1, 11)],
            [term.getEntryIndx(1, 12)]]);
    }
    //  Va a ocultar el texto 12 y mostrar el 13
    else if (total == 12) {
        term.write(desbloqueo);
        ml.changePermissions([
            [term.getEntryIndx(1, 12)],
            [term.getEntryIndx(1, 13)]]);
    }
    //  Va a ocultar el texto 13, mostrar el 14 y bloquear el living
    else if (total == 13) {
        term.write(desbloqueo);
        //  Va a puerta_cancel si no está ahí
        ml.dirSend(term.cwd, term.getEntryIndx(1, 3, true), function () {
            ml.changePermissions([
                [term.getEntryIndx(1, 13)],
                [term.getEntryIndx(1, 14)],
                [term.getEntryIndx(1, 2, true), true]]);
        });
    }
    //  Va a ocultar el texto 14, mostrar el 15 y bloquear la puerta_cancel
    else if (total == 14) {
        term.write(desbloqueo);
        //  Va a zaguan si no está ahí
        ml.dirSend(term.cwd, term.getEntryIndx(1, 5, true), function () {
            ml.changePermissions([
                [term.getEntryIndx(1, 14)],
                [term.getEntryIndx(1, 15)],
                [term.getEntryIndx(1, 3, true), true]]);
        });
    }
    //  Va a desocultar todo y mostrar un mensaje de conclusión
    else if (total == 15) {
        term.write(fin);
        ml.changePermissions([
            [term.getEntryIndx(1, 1), true, true],
            [term.getEntryIndx(1, 2), true, true],
            [term.getEntryIndx(1, 3), true, true],
            [term.getEntryIndx(1, 4), true, true],
            [term.getEntryIndx(1, 5), true, true],
            [term.getEntryIndx(1, 6), true, true],
            [term.getEntryIndx(1, 7), true, true],
            [term.getEntryIndx(1, 8), true, true],
            [term.getEntryIndx(1, 9), true, true],
            [term.getEntryIndx(1, 10), true, true],
            [term.getEntryIndx(1, 11), true, true],
            [term.getEntryIndx(1, 12), true, true],
            [term.getEntryIndx(1, 13), true, true],
            [term.getEntryIndx(1, 14), true, true],
            [term.getEntryIndx(1, 15), true, true],
            [term.getEntryIndx(1, 1, true), true, true],
            [term.getEntryIndx(1, 2, true), true, true],
            [term.getEntryIndx(1, 3, true), true, true]]);
    }
}
