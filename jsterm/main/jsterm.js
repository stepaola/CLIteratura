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

(function () {
    //  Ayudará para las versiones móbiles para ver si el input está en focus y para detectar un dispositivo móvil
    var onFocus,
        mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent);
        android = /Android/i.test(navigator.userAgent),
        savedData = {},
        wait = true,
        promptStart = true,
        lessons = ["jsterm/texts/1-lesson01.json"];

    //  Se despliega una alerta si no es posible guardar el progreso
    if (typeof(Storage) === "undefined")
        alert(noLS);
    else
        console.log(localStorage);

    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis ?
                        this :
                        oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    //  Obtiene el contenido de los archivos JSON
    function loadFS(name, cb, r) {
        var ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200)
                cb(ajax.responseText);
        };

        ajax.open('GET', name);
        ajax.send();
    };

    var Terminal = {
        init: function (config, fs, commands, cb) {
            this._queue = [];
            this._history = [];
            this._historyIndex = -1;
            this.loadConfig(config);

            if (commands)
                this.loadCommands(commands);


            if (fs)
                this.loadFS(fs, cb);
            else if (cb)
                cb();
        },

        //  Llama a cargar los contenidos
        loadFS: function (name, cb) {
            //  Corresponde a la función «loadFS» que está en la línea 60+
            loadFS(name, function (responseText) {
                var t = this;

                //  El valor «this» se guarda en «a» para usarlo en el la función «loadFS» que está adentro del loop
                t.fs = JSON.parse(responseText);

                //  Se cargan cada una de los lecciones
                for (var i = 0; i < lessons.length; i++) {
                    //  Se guarda para después usarla en la siguiente función «loadFS»
                    var iF = i;

                    //  Llama a cargar las lecciones
                    loadFS (lessons[i], function (responseText) {
                        var lessonObj = JSON.parse(responseText),
                            exists = false;

                        t.fs.contents.push(lessonObj);

                        //  Si ya se trata de la última lección, se añade todo y se inicia la ejecución de comandos
                        if (iF == lessons.length - 1)
                            t.finishLoad(t, t.fs, cb);
                    });
                }
            }.bind(this));
        },

        loadCommands: function (commands) {
            this.commands = commands;
            this.commands._terminal = this;
        },

        loadConfig: function (config) {
            this.config = config;
        },

        finishLoad: function (t, a, cb) {
            t._addDirs(a, a);
            cb && cb();


        },

        begin: function (element) {
            var parentElement = element || document.body;

            //  Valida el path si está guardado
            this.validPath();

            this.div = document.createElement('div');
            this.div.id = ('jsterm');
            parentElement.appendChild(this.div);

            //  Añade un mayor margen inferior si es un dispositivo móvil por el input que se va a crear
            if (mobile) {
                //  Si el dispositivo tiene una anchura menor a 720, se agranda la fuente y acomoda el margen inferior por ese cambio
                if (window.innerWidth >= 720)
                    this.div.classList.add("mobile");
                else {
                    document.body.classList.add("magnify");
                    this.div.classList.add("mobile-magnify");
                }
            }

            window.onkeydown = function (e) {
                //  Solo es posible si no hay espera
                if (!wait) {
                    var key = (e.which) ? e.which : e.keyCode;

                    //  La tecla 8 es la de retroceso, solo se evita que funcione si el input no está en focus
                    if ((key == 8 && !onFocus) || key == 9 || key == 13 || key == 46 || key == 38 || key == 40 || e.ctrlKey)
                        e.preventDefault();

                    this._handleSpecialKey(key, e);
                }
            }.bind(this);

            window.onkeypress = function (e) {
                //  Solo es posible si no hay espera
                if (!wait) {
                    this._typeKey((e.which) ? e.which : e.keyCode);
                }
            }.bind(this);

            //  Si no hay datos guardados, inicia en el directorio de promptStart
            if (localStorage.user === undefined || localStorage.path === undefined)
                this.cwd = this.fs;
            //  Si hay datos guardados, inicia en donde estaba
            else {
                this.cwd = this.getEntry(localStorage.path);
            }

            //  Para poner las lecciones en el estado en como se dejaron
            if (localStorage.tracked !== undefined) {
                var trackers = JSON.parse(localStorage.tracked),
                    k = Object.keys(trackers);

                //  Se itera cada una de las llaves de los trackers, que es igual a "lesson" + N
                for (var i = 0; i < k.length; i++) {
                    l = trackers[k[i]];

                    //  Se itera cada uno de los valores de la llave, que es igual a los archivos ya vistos
                    for (var j = 0; j < l.length; j++) {
                        //  Si no existe la llave para los trackers, se crea
                        if (savedData.tracked === undefined)
                            savedData.tracked = {};

                        //  Si no existe la llave para cada lección, se crea
                        if (savedData.tracked[k[i]] === undefined)
                            savedData.tracked[k[i]] = [];

                        //  Se agrega el valor y se llama a la función para desatar las acciones que ya se habían desatado
                        savedData.tracked[k[i]].push(l[j]);
                        particularFunction(parseInt(k[i].replace("lesson", "")), true);
                    }
                }
            }

            this.returnHandler = this._execute;
            this._prompt();
            this._toggleBlinker(600);
            this._dequeue();
        },

        getCWD: function () {
            return this.dirString(this.cwd);
        },

        dirString: function (d) {
            var dir = d,
                dirStr = '';

            while (this._dirNamed('..', dir.contents).contents !== dir.contents) {
                dirStr = '/' + dir.name + dirStr;
                dir = this._dirNamed('..', dir.contents);
            }
            return '~' + dirStr;
        },

        //  Obtiene el fichero según el path
        getEntry: function (path) {
            var entry,
                parts;

            //  Si lo ingresado no es nada, regresa nulo
            if (!path)
                return null;

            //  Si una vez eliminado los espacios al promptStart y al final de la línea es nada, regresa nulo
            path = path.trim();
            if (!path.length)
                return null;

            //  Indica el directorio actual
            entry = this.cwd;

            if (path[0] == '~') {
                entry = this.fs;
                path = path.substring(1, path.length);
            }

            parts = path.split('/').filter(function (x) {
                return x;
            });

            for (var i = 0; i < parts.length; ++i) {
                entry = this._dirNamed(parts[i], entry.contents);
                if (!entry)
                    return null;
            }

            return entry;
        },

        //  Obtiene el fichero según el índice
        getEntryIndx: function (index, dir) {
            var entryTrack = null;

            /*
                Si se trata de un archivo es posible llamarla con:
                    getEntryIndx(i) | getEntryIndx(i, false)
                Si se trata de una carpeta es posible llamarla con:
                    getEntryIndx(i, true)
                * Es necesario espeficiar el parámetro «dir» como verdadero
                    para buscar una carpeta.
            */

            //  Función de búsqueda
            function search (entry) {
                //  Iteración que analiza todas las entradas
                for (var i = 0; i < entry.contents.length; i ++) {
                    var e = entry.contents[i],
                        s = dir == true ? e.index == index : parseInt(e.name) == index;

                    //  Si la entrada es de la lección actual, tiene el número de índice buscado
                    if (e.track == savedData.lessonActual && s) {
                        //  Se consigue la entrada deseada y se termina la función
                        entryTrack = e;
                        break;
                    }

                    //  Si no se ha encontrado nada, se analiza el siguiente nivel de ficheros
                    if (e.type == "dir")
                        search(e);
                }
            }

            //  Llama a la búsqueda empezando con la carpeta raíz
            search(this.getEntry("~"));

            //  Resultado: si se encontró da el objecto, de lo contrario es nulo
            return entryTrack;
        },

        write: function (text) {
            var output = this.stdout();

            if (!output)
                return;

            output.innerHTML += text;
        },

        defaultReturnHandler: function () {
            this.returnHandler = this._execute;
        },

        //  Escribe los comandos
        typeCommand: function (command, cb) {
            var that = this;

            //  Evitará que se pueda teclear mientras se escribe
            wait = true;

            (function type(i) {
                if (i == command.length) {
                    //  Finaliza de escribir, por lo que se vuelve a habilitar el teclado
                    wait = false;
                    that._handleSpecialKey(13);
                    if (cb) cb();
                } else {
                    that._typeKey(command.charCodeAt(i));
                    setTimeout(function () {
                        type(i + 1);
                    }, 100);
                }
            })(0);
        },

        //  Permite el autocompletar
        tabComplete: function (text) {
            var parts = text.replace(/^\s+/, '').split(' '),
                matches = [],
                fullPath,
                pathParts,
                last,
                dir;

            if (!parts.length)
                return [];

            if (parts.length == 1) {
                pathParts = parts[0].replace(/[\/]+/, '/').split('/');
                last = pathParts.pop();
                dir = (pathParts.length > 0) ? this.getEntry(pathParts.join('/')) : this.cwd;

                //  Si no se ingresó nada ya no continúa
                if (pathParts == "")
                    return [];

                if (dir) {
                    var n;

                    for (var i in dir.contents) {
                        n = dir.contents[i].name;
                        if (n.startswith(last) && !n.startswith('..') && n != last) {
                            if (dir.contents[i].type == 'exec' && dir.contents[i].visible != false)
                                matches.push(n + ' ');
                        }
                    }
                }

                for (var c in this.commands) {
                    // Private member.
                    if (c[0] == '_')
                        continue;
                    if (c.startswith(parts[0]) && c != parts[0])
                        matches.push(c + ' ');
                }
            } else {
                fullPath = parts[parts.length - 1];
                pathParts = fullPath.replace(/[\/]+/, '/').split('/');
                last = pathParts.pop();
                dir = (pathParts.length > 0) ? this.getEntry(pathParts.join('/')) : this.cwd;

                //  Si no se ingresó nada ya no continúa
                if (!dir || last == "")
                    return [];

                for (var i in dir.contents) {
                    n = dir.contents[i].name;
                    if (n.startswith(last) && !n.startswith('..') && n != last) {
                        if (dir.contents[i].visible != false) {
                            if (dir.contents[i].type == 'dir')
                                matches.push(n + '/');
                            else
                                matches.push(n + ' ');
                        }
                    }
                }
            }

            return matches;
        },

        enqueue: function (command) {
            this._queue.push(command);

            return this;
        },

        //  Hace scroll hasta el fondo
        scroll: function () {
            window.scrollTo(0, document.body.scrollHeight);
        },

        parseArgs: function (argv) {
            var args = [],
                filenames = [],
                opts;

            for (var i = 0; i < argv.length; ++i) {
                if (argv[i].startswith('-')) {
                    opts = argv[i].substring(1);
                    for (var j = 0; j < opts.length; ++j)
                        args.push(opts.charAt(j));
                } else {
                    filenames.push(argv[i]);
                }
            }
            return {
                'filenames': filenames,
                'args': args
            };
        },

        //  Añade el enlace según su tipo
        writeLink: function (e, str) {
            this.write('<span class="' + e.type + '">' + this._createLink(e, str) +
                '</span>');
        },

        //  Obtiene lo ingresado
        stdout: function () {
            return this.div.querySelector('#stdout');
        },

        // Crea un nuevo ingreso a partir de lo ingresado con anterioridad
        newStdout: function () {
            var stdout = this.stdout(),
                newstdout = document.createElement('span');

            this._resetID('#stdout');
            newstdout.id = 'stdout';
            stdout.parentNode.insertBefore(newstdout, stdout.nextSibling);
        },

        //  Valida el path o lo cambia
        validPath: function () {
            if (localStorage.path !== undefined) {
                var p = localStorage.path.split("/");

                //  Función recursiva de validación
                function validate (e, l) {

                    //  Iteración para comprobar cada parte del path
                    for (var i = 0; i < e.contents.length; i++) {

                        //  Solo analiza los directorios
                        if (e.contents[i].type == "dir") {

                            //  Si el nombre de un directorio existente es igual al de la parte actual del path
                            if (e.contents[i].name == p[l]) {

                                //  Si existe un nivel más, vuelve a llamar la función y rompe la ejecución actual
                                if (l + 1 <= p.length - 1) {
                                    validate(e.contents[i], l + 1);
                                    break;
                                //  Rompe la ejecución actual
                                } else
                                    break;
                            }

                            //  Si no hubo igualdad, se cambia el path para iniciar en el directorio inicial
                            if (i == e.contents.length - 1)
                                localStorage.path = "~";
                        }
                    }
                }

                //  Llama a iniciar la validación
                validate(this.fs, 1);

                //  Ingresa los valores previos para evitar que reinicie la suma
                if (localStorage.times !== undefined)
                    savedData.times = JSON.parse(localStorage.times);

                //  Si se quedó adentro de una lección, reinicia el timer
                if (localStorage.lessonActual !== undefined) {
                    var entry = this.getEntry(localStorage.path);
                    dirTracking(entry);
                }
            }
        },

        _createLink: function (entry, str) {
            var cls = 'class="' + entry.name.replace(/\s+/g, '') + '"';

            function typeLink(text, link) {
                return '<a href="javascript:void(0)" ' + cls +
                    ' onclick="typeCommand(\'' + text + '\')">' + link + '</a>';
            };

            if (entry.type == 'dir' || entry.type == 'link') {
                return typeLink('cd ' + str, entry.name);
            } else if (entry.type == 'text') {
                return typeLink('cat ' + str, entry.name);
            } else if (entry.type == 'img') {
                return typeLink('gimp ' + str, entry.name);
            } else if (entry.type == 'exec') {
                return '<a href="' + entry.contents + '" target="_blank" ' + cls +
                    ' >' + entry.name + '</a>';
            }
        },

        _dequeue: function () {
            if (!this._queue.length)
                return;

            this.typeCommand(this._queue.shift(), function () {
                this._dequeue()
            }.bind(this));
        },

        _dirNamed: function (name, dir) {
            for (var i in dir) {
                if (dir[i].name == name) {
                    if (dir[i].type == 'link')
                        return dir[i].contents;
                    else
                        return dir[i];
                }
            }
            return null;
        },

        _addDirs: function (curDir, parentDir) {
            curDir.contents.forEach(function (entry, i, dir) {
                if (entry.type == 'dir')
                    this._addDirs(entry, curDir);
            }.bind(this));
            curDir.contents.unshift({
                'name': '..',
                'type': 'link',
                'contents': parentDir
            });
            curDir.contents.unshift({
                'name': '.',
                'type': 'link',
                'contents': curDir
            });
        },

        _toggleBlinker: function (timeout) {
            var blinker = this.div.querySelector('#blinker'),
                stdout;

            if (blinker) {
                blinker.parentNode.removeChild(blinker);
            } else {
                stdout = this.stdout();
                if (stdout) {
                    blinker = document.createElement('span');
                    blinker.id = 'blinker';
                    blinker.innerHTML = '&#x2588';
                    stdout.parentNode.appendChild(blinker);
                }
            }

            if (timeout) {
                setTimeout(function () {
                    this._toggleBlinker(timeout);
                }.bind(this), timeout);
            }
        },

        _resetID: function (query) {
            var element = this.div.querySelector(query);

            if (element)
                element.removeAttribute('id');
        },

        _prompt: function () {
            var div = document.createElement('div'),
                prompt = document.createElement('span'),
                command = document.createElement('span');

            this._resetID('#currentPrompt');
            this.div.appendChild(div);

            prompt.classList.add('prompt');
            prompt.id = 'currentPrompt';

            //  Si es la primera vez
            if (localStorage.user === undefined || localStorage.path === undefined) {
                prompt.innerHTML = this.config.prompt(this.getCWD(), this.config.username);
                localStorage.path = this.getCWD();

                promptStart = false;
            }
            //  Si se regresa
            else {
                //  Si se reinició
                if (promptStart) {
                    var oldDate = JSON.parse(localStorage.date),
                        actualDate,
                        dayStr,
                        monthStr,
                        hourSrt,
                        hour12;

                    //  Obitene la fecha actual
                    saveDate();
                    actualDate = JSON.parse(localStorage.date);

                    //  Obtiene el nombre del día de la semana
                    switch (oldDate.dayWeek) {
                        case 0:dayStr = "Sun";break;
                        case 1:dayStr = "Mon";break;
                        case 2:dayStr = "Tue";break;
                        case 3:dayStr = "Wed";break;
                        case 4:dayStr = "Thu";break;
                        case 5:dayStr = "Fri";break;
                        case 6:dayStr = "Sat";break;
                    }

                    //  Obtiene el nombre del mes
                    switch (oldDate.month) {
                        case 1:monthStr = "Jan";break;
                        case 2:monthStr = "Feb";break;
                        case 3:monthStr = "Mar";break;
                        case 4:monthStr = "Apr";break;
                        case 5:monthStr = "May";break;
                        case 6:monthStr = "Jun";break;
                        case 7:monthStr = "Jul";break;
                        case 8:monthStr = "Aug";break;
                        case 9:monthStr = "Sep";break;
                        case 10:monthStr = "Oct";break;
                        case 11:monthStr = "Nov";break;
                        case 12:monthStr = "Dec";break;
                    }

                    //  Obtiene el formato de doce horas
                    if (actualDate.hour > 12){
                        hour12 = actualDate.hour - 12;
                        hourSrt = "p.m.";
                    } else {
                        hour12 = actualDate.hour;
                        hourSrt = "a.m.";
                    }

                    //  Ingresa los datos de la restauración y último ingreso
                    prompt.innerHTML =  '<span id="restored">  [Restored: ' + actualDate.day + '/' + actualDate.month + '/' + actualDate.year + ' ' + hour12 + ':' + actualDate.minute + ':' + actualDate.second + ' ' + hourSrt + ']</span>' +
                                        '<span id="last-login">Last login: ' + dayStr + ' ' + monthStr + ' ' + oldDate.day + ' ' + oldDate.hour + ':' + oldDate.minute + ':' + oldDate.second + ' on console</span><br />';

                    promptStart = false;
                }

                prompt.innerHTML += this.config.prompt(localStorage.path, localStorage.user);
            }

            div.appendChild(prompt);

            this._resetID('#stdout');
            command.classList.add('command');
            command.id = 'stdout';
            div.appendChild(command);
            this._toggleBlinker(0);
            this.scroll();
        },

        _typeKey: function (key) {
            var stdout = this.stdout();

            if (!stdout || key < 0x20 || key > 0x7E || key == 13 || key == 9)
                return;

            stdout.innerHTML += String.fromCharCode(key);
        },

        _handleSpecialKey: function (key, e) {
            var stdout = this.stdout(),
                parts,
                pathParts;

            if (!stdout)
                return;
            // Backspace/delete.
            if (key == 8 || key == 46)
                stdout.innerHTML = stdout.innerHTML.replace(/.$/, '');
            // Enter.
            else if (key == 13) {
                this.returnHandler(stdout.innerHTML);

                //  Si es un dispositivo móvil y el input está en focus, se le borra el texto
                if (mobile && onFocus) {
                    document.getElementById("text-field").value = "";
                }
            }
            // Up arrow.
            else if (key == 38) {
                if (this._historyIndex < this._history.length - 1)
                    stdout.innerHTML = this._history[++this._historyIndex];
                // Down arrow.
            } else if (key == 40) {
                if (this._historyIndex <= 0) {
                    if (this._historyIndex == 0)
                        this._historyIndex--;
                    stdout.innerHTML = '';
                } else if (this._history.length)
                    stdout.innerHTML = this._history[--this._historyIndex];
                // Tab.
            } else if (key == 9) {
                matches = this.tabComplete(stdout.innerHTML);
                if (matches.length) {
                    parts = stdout.innerHTML.split(' ');
                    pathParts = parts[parts.length - 1].split('/');
                    pathParts[pathParts.length - 1] = matches[0];
                    parts[parts.length - 1] = pathParts.join('/');
                    stdout.innerHTML = parts.join(' ');
                }
                // Ctrl+C, Ctrl+D.
            } else if ((key == 67 || key == 68) && e.ctrlKey) {
                if (key == 67)
                    this.write('^C');
                this.defaultReturnHandler();
                this._prompt();
            }
        },

        _execute: function (fullCommand) {
            var output = document.createElement('div'),
                stdout = document.createElement('span'),
                parts = fullCommand.split(' ').filter(function (x) {
                    return x;
                }),
                command = parts[0],
                args = parts.slice(1, parts.length),
                entry = this.getEntry(fullCommand),
                valid = false;

            this._resetID('#stdout');
            stdout.id = 'stdout';
            output.appendChild(stdout);
            this.div.appendChild(output);

            if (command && command.length) {
                if (command in this.commands) {
                    valid = true;
                    this.commands[command](args, function () {
                        this.defaultReturnHandler();
                        this._prompt()
                    }.bind(this));
                } else if (entry && entry.type == 'exec') {
                    window.open(entry.contents, '_blank');
                    this._prompt();
                } else {
                    this.write(command + ': command not found');
                    this._prompt();
                }
            } else {
                this._prompt()
            }
            if (fullCommand.length)
                this._history.unshift(fullCommand);
            this._historyIndex = -1;

            if (window.heap) {
                heap.track('Command', {
                    command: command,
                    full: fullCommand,
                    valid: valid
                });
            }
        }
    };

    String.prototype.startswith = function (s) {
        return this.indexOf(s) == 0;
    }

    var term = Object.create(Terminal);
    term.init(CONFIG, 'jsterm/texts/0-home_directory.json', COMMANDS, function () {
        //  Solo se muestra la primera vez
        if (localStorage.date === undefined) {
            term.enqueue('login')
                .enqueue(usuarioDefault)
                .enqueue(contrasenaDefault)
                .enqueue('cat README')
                .enqueue('help');
        //  Muestra el README en las otras veces
        } else {
            term.enqueue('cat ~/README');
        }

        //  Siempre ejecuta esto para desbloquear el teclado
        term.enqueue('ls -l')
            .begin();
    });

    window.typeCommand = function (command) {
        term.typeCommand(command);
    };

    //  Si es un dispositivo móvil, se agrega un input y unos listeners
    if (mobile) {
        //  Creación del input
        var input = document.createElement("input");
        input.type = "text";
        input.id = "text-field";
        input.value = "";
        input.placeholder = campo;
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocorrect", "off");
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("spellcheck", "off");
        document.body.appendChild(input);

        //  Adición de listeners
        input.addEventListener("focus", function () {
            onFocus = true;
        });

        input.addEventListener("blur", function () {
            onFocus = false;
        });

        //  En Android no se escribe el texto del input en el prompt de manera determinada
        if (android) {
            input.addEventListener("input", function () {
                stdout.innerHTML = input.value;
            });
        }
    }

    //  Creación del botón de ayuda
    var help = document.createElement("div");
    help.id = "help";
    help.innerHTML = "<p>" + ayudaBoton + "</p>";
    document.body.appendChild(help);

    help.addEventListener("click", function () {
        typeCommand('help');
    })
})();
