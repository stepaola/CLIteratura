var leyente = 'leyente',
    host = 'cliteratura',
    campo = "Escribe algún comando…",
    ayuda1 = 'Para navegar puedes utilizar los comandos en la terminal o hacer clic sobre algún fichero.<br /><br />Existen los siguientes tipos de ficheros:<br />-<span class="dir">Directorios</span>: son las carpetas que contienen más ficheros.<br />-<span class="text">Archivos de texto</span>: son ficheros que contienen texto.<br />-<span class="exec">Ejecutables</span>: son los programas que la terminal inicia; en el caso de CLIteratura cada programa representa un hiperenlace externo.<br />-<span class="img">Imágenes</span>: son archivos de gráficos.<br /><br /><i>Si es la primera vez que tienes contacto con una interfaz de línea de comandos, empieza por usar el ratón y observa cómo se escriben las órdenes. (:</i><br /><br />Los comandos disponibles son:<br />',
    ayuda2 = '<br />Para cancelar el ingreso de un comando usa Control + C. Esto es muy útil si la terminal se queda «colgada»; es decir, si deja de responder, usualmente por un erróneo ingreso de comandos.<br /><br />¿No sabes qué hacer ahora? Prueba con escribir «ls» o «tree» para ver a cuáles ficheros puedes acceder.',
    ayudaBoton = "?",
    comandos = {
        cat : "muestra el contenido de los archivos.",
        cd : "cambia de directorio.",
        clear : "limpia la pantalla.",
        gimp : "muestra el contenido gráfico.",
        help : "muestra esta ayuda.",
        login : "cambia el nombre de usuario.",
        ls : "muestra una lista de los ficheros que contiene un directorio.",
        sudo : "ejecuta un comando con privilegios de administrador.",
        tree : "muestra una estructura de árbol de los ficheros que contiene un directorio."
    }
