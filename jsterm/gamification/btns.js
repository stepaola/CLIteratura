var wait = true,    //  También afecta a jsterm.js para evitar la escritura
    help,
    clear;

//  Creación del botón de ayuda
help = document.createElement("div");
help.id = "help";
help.innerHTML = "<p>" + loc.ale(aux.helpBtn) + "</p>";
document.body.appendChild(help);

help.addEventListener("click", function () {
    //  Si no se está escribiendo nada, se pide la ayuda a la terminal
    if (!wait)
        typeCommand('help');
});

//  Creación del botón de limpieza
clear = document.createElement("div");
clear.id = "clear";
clear.innerHTML = "<p>" + loc.ale(aux.clearBtn) + "</p>";
document.body.appendChild(clear);

clear.addEventListener("click", function () {
    //  Si se confirma y la lógica principal ya está activa, se limpian los datos
    if (confirm(loc.ale(aux.clearPopup)))
        if (typeof ml !== "undefined" && !wait)
            ml.clear();
});
