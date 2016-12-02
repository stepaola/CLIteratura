var aux = {
    defaultUser: {
        contents: 'leyente',
        contents_en: 'reader'
    },
    defaultPassword: {
        contents: 'perrotriste'
    },
    host: {
        contents: 'cliteratura',
        contents_en: 'cliterature'
    },
    textField: {
        contents: "Escribe algún comando…",
        contents_en: "Type any command…"
    },
    noLS: {
        contents: "¡Ups! Tu dispositivo no permite el guardado local, haciendo imposible registar el progreso de las lecciones.",
        contents_en: "Ups! Your device doesn't allow local storage, making impossible to save the progress of the lessons. "
    },
    help1: {
        contents: 'Para navegar puedes utilizar los comandos en la terminal o hacer clic sobre algún fichero.<br /><br />Existen los siguientes tipos de ficheros:<br />-<span class="dir">Directorios</span>: son las carpetas que contienen más ficheros.<br />-<span class="text">Archivos de texto</span>: son ficheros que contienen texto.<br />-<span class="exec">Ejecutables</span>: son los programas que la terminal inicia; en el caso de CLIteratura cada programa representa un hiperenlace externo.<br />-<span class="img">Imágenes</span>: son archivos de gráficos.<br /><br /><i>Si es la primera vez que tienes contacto con una interfaz de línea de comandos, empieza por usar el ratón y observa cómo se escriben las órdenes. (:</i><br /><br />Los comandos disponibles son:<br />',
        contents_en: 'For navigate you can use the commands on the terminal or click over some file or directory.<br /><br />There are the following types of files:<br />-<span class="dir">Directories</span>: files that contain references to other files.<br />-<span class="text">Text files</span>: files that contain text.<br />-<span class="exec">Executables</span>: programs that the computer runs; in the case of CLIterature they are external links.<br />-<span class="img">Images</span>: files that contain graphics.<br /><br /><i>If this is your first contact with the command-line interface, start by using the mouse so you can see how the commands are written. (:</i><br /><br />There are the following commands:<br />'
    },
    help2: {
        contents: '<br />Para cancelar el ingreso de un comando usa Control + C. Esto es muy útil si la terminal se queda «colgada»; es decir, si deja de responder, usualmente por un erróneo ingreso de comandos.<br /><br />¿No sabes qué hacer ahora? Prueba con escribir «<a href="javascript:void(0)" onclick="typeCommand(\'ls\')">ls</a>» o «<a href="javascript:void(0)" onclick="typeCommand(\'tree\')">tree</a>» para ver cuáles ficheros puedes acceder.',
        contents_en: '<br />For cancel any command use Control + C. This is very useful if the terminal doesn\'t respond, usually because of typo mistakes.<br /><br />Don\'t know what to do next? Try by typing “<a href="javascript:void(0)" onclick="typeCommand(\'ls\')">ls</a>” or “<a href="javascript:void(0)" onclick="typeCommand(\'tree\')">tree</a>” in order to see what directories you can access.'
    },
    helpBtn: {
        contents: "?"
    },
    clearBtn: {
        contents: "↺"
    },
    clearPopup: {
        contents: "¿Quieres borrar los datos guardados? Esto te permitirá reiniciar las lecciones.",
        contents_en: "Do you want to delete the saved data? This will allow to restart the lessons."
    },
    unlocked: {
        contents: "<span class=\"unlocked\">¡Has desatado eventos en esta lección!</span>",
        contents_en: "<span class=\"unlocked\">You have triggered events in this lesson!</span>"
    },
    finished: {
        contents: "<span class=\"finished\">¡Felicidades, has terminado la lección!<br />Todos los elementos han sido desbloqueados.</span>",
        contents_en: "<span class=\"finished\">Congratulations, you have finished the lesson!<br />All the elements have been unlocked.</span>"
    },
    cmdDescription: {
        cat: {
            contents: "muestra el contenido de los archivos.",
            contents_en: "Concatenate and print (display) the content of files."
        },
        cd: {
            contents: "cambia de directorio.",
            contents_en: "Change directory."
        },
        clear: {
            contents: "limpia la pantalla.",
            contents_en: "Clear terminal screen."
        },
        gimp: {
            contents: "muestra el contenido gráfico. Ojo: este comando solo es de CLIteratura para que sea posible ver una imagen, en la CLI real no existe esta posibilidad.",
            contents_en: "Show the graphic content. Attention: this commands it is only from CLIterature so the image can be displayed, on the real CLI there is no such possibility."
        },
        help: {
            contents: "muestra esta ayuda.",
            contents_en: "Show this help."
        },
        login: {
            contents: "cambia el nombre de usuario.",
            contents_en: "Change user name."
        },
        ls: {
            contents: "muestra una lista de los ficheros que contiene un directorio.",
            contents_en: "List information about files."
        },
        sudo: {
            contents: "ejecuta un comando como otro usuario.",
            contents_en: "Execute a command as another user."
        },
        tree: {
            contents: "muestra una estructura de árbol de los ficheros.",
            contents_en: "Display a graphical directory tree."
        }
    }
}
