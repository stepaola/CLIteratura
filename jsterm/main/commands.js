// Copyright 2013 Clark DuVall
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var COMMANDS = COMMANDS || {};

COMMANDS.cat = function(argv, cb) {
    //  Obtiene los argumentos
    var filenames = this._terminal.parseArgs(argv).filenames;

    //  Hace scroll hasta el fondo
    this._terminal.scroll();

    //  Si no se ingreso ningún argumento, se recrea el comportamiento real del cat
    if (!filenames.length) {
        this._terminal.returnHandler = function() {
            //  Obtiene lo ingresado
            var stdout = this.stdout();

            //  En el primer caso será nulo, así que inicia el cuelgue creándose un stdout vacío
            if (!stdout)
                return;

            //  A partir de la segunda vez se repetirá lo que se ingrese una vez colgada
            stdout.innerHTML += '<br>' + stdout.innerHTML + '<br>';

            //  Hace scroll hasta el fondo
            this.scroll();

            //  Crea un nuevo ingreo
            this.newStdout();
        }.bind(this._terminal);

        //  Termina el comando
        return;
    }

    //  Si se ingreso algún argumento, busca leer el archivo
    filenames.forEach(function(filename, i) {
        var entry = this._terminal.getEntry(filename);

        //  Si el valor es nulo o no está visible; Ojo: la visibilidad no es para simular archivos ocultos que inician con punto, sino para no mostrarlos para nada, por algún tipo de mecánica de juego
        if (!entry || entry.visible == false)
            this._terminal.write('cat: ' + filename + ': No such file or directory');
        //  Si se trata de una carpeta
        else if (entry.type === 'dir')
            this._terminal.write('cat: ' + filename + ': Is a directory');
        //  Si no tiene permiso de acceso
        else if (entry.permission == false)
            this._terminal.write('cat: can\'t open ' + filename + ': Permission denied');
        //  Si se trata de un archivo existente, muestra su contenido
        else
            this._terminal.write(entry.contents);

        //  Crea un salto de línea si no es el último argumento ingresado
        if (i !== filenames.length - 1)
            this._terminal.write('<br>');
    }, this);

    //  Llama a un bound()
    cb();
}

COMMANDS.cd = function(argv, cb) {
    var filename = this._terminal.parseArgs(argv).filenames[0],
        entry;

    //  Si no hay argumentos, entonces se va al directorio de inicio
    if (!filename)
        filename = '~';

    //  Obtiene el contenido del argumento buscado
    entry = this._terminal.getEntry(filename);

    //  Si el valor es nulo o no está visible; Ojo: la visibilidad no es para simular archivos ocultos que inician con punto, sino para no mostrarlos para nada, por algún tipo de mecánica de juego
    if (!entry || entry.visible == false)
        this._terminal.write('bash: cd: ' + filename + ': No such file or directory');
    //  Si no se trata de una carpeta
    else if (entry.type !== 'dir')
        this._terminal.write('bash: cd: ' + filename + ': Not a directory');
    //  Si no tiene permiso de acceso
    else if (entry.permission == false)
        this._terminal.write('bash: cd: ' + filename + ': Permission denied');
    //  Si se trata de una carpeta con permiso de acceso
    else {
        this._terminal.cwd = entry;

        //  Esto ayuda a la lógica lúdica
        ubication(entry);
    }

    //  Llama a un bound()
    cb();
}

COMMANDS.clear = function(argv, cb) {
    this._terminal.div.innerHTML = '';
    cb();
}

COMMANDS.gimp = function(argv, cb) {
    var filename = this._terminal.parseArgs(argv).filenames[0],
        entry,
        imgs;

    //  Si no se ingresó nada
    if (!filename) {
        this._terminal.write('gimp: please specify an image file');
        cb();
        return;
    }

    //  Obtiene el contenido del argumento buscado
    entry = this._terminal.getEntry(filename);

    //  Si el valor es nulo, no es una imagen o no está visible; Ojo: la visibilidad no es para simular archivos ocultos que inician con punto, sino para no mostrarlos para nada, por algún tipo de mecánica de juego
    if (!entry || entry.type !== 'img' || entry.visible == false)
        this._terminal.write('gimp: file ' + filename + ' is not an image file');
    //  Si no tiene permiso de acceso
    else if (entry.permission == false)
        this._terminal.write('gimp: can\'t open ' + filename + ': Permission denied');
    //  Si se trata de una imagen con permiso de acceso
    else {
        this._terminal.write('<img src="jsterm' + entry.contents + '"/>');
        imgs = this._terminal.div.getElementsByTagName('img');
        imgs[imgs.length - 1].onload = function() {
            this.scroll();
        }.bind(this._terminal);
        if ('caption' in entry)
            this._terminal.write('<br/>' + entry.caption);
    }

    //  Llama a un bound()
    cb();
}

COMMANDS.help = function(argv, cb) {
    //  Escribe la primera parte de la ayuda
    this._terminal.write(ayuda1);

    //  En este conjunto se pondrán los comandos válidos
    var cmd = [];

    //  Obtiene los comandos y agrega todos excepto el comando «_terminal»
    for (var c in this._terminal.commands)
        if (this._terminal.commands.hasOwnProperty(c) && !c.startswith('_'))
            cmd.push(c);

    //  Ordena los comando en orden alfabético
    cmd.sort();

    //  Escribe en la terminal cada uno de los comandos más su descripción
    for (var i = 0; i < cmd.length; i++) {
        var tipo = typeof cmd[i];
        this._terminal.write('-' + cmd[i] + ': ' + comandos[cmd[i]] + '<br />');
    }

    //  Escribe la segunda parte de la ayuda
    this._terminal.write(ayuda2);

    //  Llama a un bound()
    cb();
}

COMMANDS.login = function(argv, cb) {
    this._terminal.returnHandler = function() {
        var username = this.stdout().innerHTML;

        this.scroll();
        if (username)
            this.config.username = username;
        this.write('<br>Password: ');
        this.scroll();
        this.returnHandler = function() {
            cb();
        }
    }.bind(this._terminal);
    this._terminal.write('Username: ');
    this._terminal.newStdout();
    this._terminal.scroll();
}

COMMANDS.ls = function(argv, cb) {
    var result = this._terminal.parseArgs(argv),
        args = result.args,
        filename = result.filenames[0],
        entry = filename ? this._terminal.getEntry(filename) : this._terminal.cwd,
        maxLen = 0,
        writeEntry;

    // Función para escribir los ficheros que contiene el directorio
    writeEntry = function(e, str) {

        //  Añade el enlace según su tipo
        this.writeLink(e, str);

        //  Si hay un argumento «-l» se escribe de manera extendida
        if (args.indexOf('l') > -1) {
            if ('description' in e)
                this.write(' - ' + e.description);
            this.write('<br>');
        //  Si no hay argumento «-l» se escribe de manera compacta
        } else {
            //  Make all entries the same width like real ls. End with a normal space so the line breaks only after entries.
            this.write(Array(maxLen - e.name.length + 2).join('&nbsp') + ' ');
        }
    }.bind(this._terminal);

    //  Si no hay entrada se indica su inexistencia
    if (!entry)
        this._terminal.write('ls: cannot access ' + filename + ': No such file or directory');
    //  Si se trata de un directorio
    else if (entry.type === 'dir') {
        //  Si no hay permiso se niega mostrar el contenido
        if (entry.permission == false) {
            this._terminal.write('ls: cannot access ' + filename + ': Permission denied');
        } else {
            var dirStr = this._terminal.dirString(entry);

            //  Ayuda para acomodar adecuadamente la lista si se mostrará compacta
            maxLen = entry.contents.reduce(function(prev, cur) {
                return Math.max(prev, cur.name.length);
            }, 0);

            //  Se itinera el contenido del directorio
            for (var i in entry.contents) {
                var e = entry.contents[i];

                //  Enlista los contenidos, contemplando o no el argumento «-a», solo si la visibilidad no es falsa
                if (args.indexOf('a') > -1 || e.name[0] !== '.')
                    if (e.visible != false)
                        writeEntry(e, dirStr + '/' + e.name);
            }
        }
    //  Si se trata de un archivo
    } else {
        //  Ayuda para acomodar adecuadamente la lista si se mostrará compacta
        maxLen = entry.name.length;

        //  Enlista los contenidos solo si la visibilidad no es falsa
        if (e.visible != false)
            writeEntry(entry, filename);
    }

    //  Llama a un bound()
    cb();
}

// COMMANDS.sudo = function(argv, cb) {
//     var count = 0;
//     this._terminal.returnHandler = function() {
//         if (++count < 3) {
//             this.write('<br/>Sorry, try again.<br/>');
//             this.write('[sudo] password for ' + this.config.username + ': ');
//             this.scroll();
//         } else {
//             this.write('<br/>sudo: 3 incorrect password attempts');
//             cb();
//         }
//     }.bind(this._terminal);
//     this._terminal.write('[sudo] password for ' + this._terminal.config.username + ': ');
//     this._terminal.scroll();
// }

COMMANDS.tree = function(argv, cb) {
    var term = this._terminal,
        home;

    function writeTree(dir, level) {
        dir.contents.forEach(function(entry) {
            var str = '';

            if (entry.name.startswith('.'))
                return;
            for (var i = 0; i < level; i++)
                str += '|  ';
            str += '|&mdash;&mdash;';
            term.write(str);
            term.writeLink(entry, term.dirString(dir) + '/' + entry.name);
            term.write('<br>');
            if (entry.type === 'dir')
                writeTree(entry, level + 1);
        });
    };
    home = this._terminal.getEntry('~');
    this._terminal.writeLink(home, '~');
    this._terminal.write('<br>');
    writeTree(home, 0);
    cb();
}
