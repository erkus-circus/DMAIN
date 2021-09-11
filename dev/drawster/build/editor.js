(function (window) {
    // Has functions for resizing and changing canvases
    window.Project.prototype.Canvas = {
        // default width and height
        width: 900,
        height: 900,

        // resizes every canvas, and keeps the image from before
        resizeCanvases: function (canvases) {
            for (i in canvases) {
                var canvas = canvases[i];
                for (let j = 0; j < canvas.length; j++) {
                    const ctx = canvas[j].getContext("2d");
                    var imageData = ctx.getImageData(0, 0, canvas[j].width, canvas[j].height);
                    $(canvas[j]).width(this.width).csswidth(this.width * Project.Editor.zoomLevel).marginLeft((-this.width - Project.Editor.zoomLevel) / 2);
                    $(canvas[j]).height(this.height).cssheight(this.height * Project.Editor.zoomLevel);
                    ctx.putImageData(imageData, 0, 0);
                }
            }
        },

        // resize canvases messageBox
        resize: function () {
            Project.MessageBox.setMessage("ResizeCanvases");
            Project.MessageBox.show();
        },

        // user pressed submit on the resize messageBox
        resizeConfirmed: function (opts) {

            Project.Canvas.width = parseInt(opts.width);
            Project.Canvas.height = parseInt(opts.height);

            // changes size of all canvases
            Project.Canvas.resizeCanvases([$("canvas")]);

            Project.MessageBox.hide();
        }
    };
})(window);(function (window) {
    window.Project.prototype.Editor = {
        // zooming functions
        zoomOut: function (delta) {
            Project.Editor.zoom(1)
        },
        zoomIn: function (delta) {
            Project.Editor.zoom(-1);
        },
        resetZoom: function () {
            Project.Editor.zoomLevel = 1;
            Project.Canvas.resizeCanvases([$("canvas")]);
        },
        zoomLevel: 1,
        zoom: function (delta) {
            if (delta < 0) {
                delta = 90
            } else {
                delta = -90
            }
            Project.Editor.zoomLevel += delta / 1000;
            Project.Canvas.resizeCanvases([$("canvas")]);
        },

        // other functions (some not related to the editor)
        clear: function () {
            localStorage.clear();
            sessionStorage.clear();
            window.Project = new window.ProjectConstructor;
        },
        save: function () {
            alert("saving")
        },
        saveAs: function () { },
        open: function () {
            alert("Opened new project")
        },
        idIndex: 0,
        genID: function () {
            return `ID${++this.idIndex}-`;
        },

        // return a 
        getPath: function (path) {
            return path.split('.').reduce((o, i) => o[i], window);
        },

        swapArrayElem: function (array, i, j) {
            [array[i], array[j]] = [array[j], array[i]];
            return array;
        },
        getMousePosition: function (canvas, e) { // find mouse position on "canvas"
            var rt = canvas[0].getBoundingClientRect(), // abs. size of element
                scaleX = canvas.width()[0] / rt.width, // relationship bitmap vs. element for X
                scaleY = canvas.height()[0] / rt.height; // relationship bitmap vs. element for Y

            return [
                (e.clientX - rt.left) * scaleX,
                (e.clientY - rt.top) * scaleY
            ];
        },
        distance: function (pos1, pos2) {
            return Math.sqrt(Math.pow(pos2[0] - pos1[0], 2) + Math.pow(pos2[1] - pos1[1], 2));
        },
        oppositeRGB: function (rgb) {
            return rgb.map(function (color) {
                return 255 - color;
            });
        }
    };
})(window);/* For key commands and things like that */
// records your keys
(function (window) {
  var controlKeys = ["Control", "Alt"];

  window.Project.prototype.Keys = {
    pressed: [],

    // check if a key is pressed
    isPressed: (key) => Project.Keys.pressed.indexOf(key) >= 0,
  };

  // add
  $(window).load(() => {
    // when user unfocuses window, clear all the keys that have been pressed
    $(window).on("unfocus", function () {
      Project.Keys.pressed = [];
    });

    $(window).keydown(function (e) {
      // prevent OS keys
      if (controlKeys.includes(e.key)) {
        e.preventDefault();
      }

      // if the key is already pressed, return
      if (Project.Keys.isPressed(e.key)) return;

      // else: add the key to the keys that have already been pressed
      Project.Keys.pressed.push(e.key);
    });

    // remove key from the keys pressed
    $(window).keyup(function (e) {
      if (controlKeys.includes(e.key)) {
        e.preventDefault();
      }

      while (Project.Keys.pressed.indexOf(e.key) >= 0) {
        Project.Keys.pressed.splice(Project.Keys.pressed.indexOf(e.key), 1);
      }
    });
  });
})(window);
(function (window) {
    function updateLayers() {
        $(".canvases")
            .html("");
        $(".layer-editor")
            .html("");
        for (let i = 0; i < Project.Layers.layers.length; i++) {
            const layer = Project.Layers.layers[i];

            // Set Z-Index for canvases, untested
            $(".canvases")
                .append(layer.canvas.zIndex(i));

            // selected layer

            //layer editor
            // ID of layer + S + (D|R|C|B(ox)) as selector, so when deleting layer, delete buttons
            var btnDel = $("<span>")
                .className("layer-button delete-layer")
                .id(layer.ID + "D");
            btnDel
                .text("D")
                .title("Delete layer");
            btnDel
                .click(function (e, elem) {
                    delLayer(elem.id()[0]);
                });

            var btnRen = $("<span>")
                .className("layer-button rename-layer")
                .id(layer.ID + "R")
                .title("Rename layer");
            btnRen
                .text("R");
            btnRen
                .click(function (e, elem) {
                    renameLayer(elem.id()[0]);
                });

            // move layer up
            var btnUp = $("<span>")
                .className("layer-button up-layer")
                .id(layer.ID + "UA")
                .html("&uarr;")
                .click(handleUpArrow)
                .title("Move layer up");
            var btnDown = $("<span>")
                .className("layer-button up-layer")
                .id(layer.ID + "DA")
                .html("&darr;")
                .click(handleDownArrow)
                .title("Move layer down");

            var btnShow = $("<pre>")
                .className("layer-button toggle-layer")
                .id(layer.ID + "SH")
                .html(layer.showing ? "&check;" : "_")
                .click(handleToggleShow)
                .title("Toggle if layer is showing");
            var buttonBox = $("<span>")
                .className("layer-buttons").append($.merge(btnShow));

            var buttonBox2 = $("<span>")
                .className("layer-buttons right")
                .append($.merge(btnDel, btnRen, btnUp, btnDown));
            var nameBox = $("<span>")
                .className("layer-name")
                .id(layer.ID + "N")
                .text(layer.name)
                .title("Select layer to edit");

            var selector = $("<div>")
                .className("layer-box left")
                .id(layer.ID + "B")
                .append($([buttonBox[0], nameBox[0], buttonBox2[0]]));


            $('.layer-editor').prepend(selector);

        }
        $("#" + Project.Layers.selected + "B")
            .addClass("layer-selected");

        // select layer
        $(".layer-name")
            .click(setLayer);
    }

    function getLayerByIndex(index) {
        return Project.Layers.layers[index];
    }

    function setLayer(e, elem) {
        $(".layer-box")
            .removeClass("layer-selected");
        $(elem[0])
            .parent()
            .addClass("layer-selected");

        var layer = getLayerByIndex(getLayerIndexByID(elem.id()[0]));
        Project.Layers.selected = layer.ID;
        Project.Layers.selectedCanvas = layer.canvas;
        Project.Layers.selectedContext = layer.ctx;
    }

    function rawID(ID) {
        var ID2 = "";
        for (let i = 0; i < ID.length; i++) {
            ID2 += ID[i];
            if (ID[i] === "-") {
                break;
            }
        }
        return ID2;
    }

    function getLayerIndexByID(ID) {
        // SLICE ID TO ARG
        ID = rawID(ID);

        for (let i = 0; i < Project.Layers.layers.length; i++) {
            const layer = Project.Layers.layers[i];
            if (layer.ID == ID) {
                return i;
            }
        }
    }

    function delLayer(ID) {
        if (Project.Layers.layers.length < 2) {
            Project.MessageBox.setMessage("OneLayerError");
            Project.MessageBox.show();
            return;
        }
        // here: layer is still selected
        $("#" + rawID(ID)).remove();
        $("#" + rawID(ID) + "B").remove();
        Project.Layers.layers.splice(getLayerIndexByID(ID), 1);

        // set layer to layer 0
        // picks the 0th ID
        setLayer(null, $(".layer-name"));
    }

    function renameLayer(ID) {
        Project.MessageBox.setMessage("RenameLayer");
        Project.MessageBox.set("ID", ID.slice(0, -1));
        Project.MessageBox.show();
    }


    function handleToggleShow(e, elem) {
        var ID = elem.id()[0];

        if (elem.text()[0] === "_") {
            elem.html("&check;")
        } else {
            elem.html("_")
        }
        Project.Layers.layers[getLayerIndexByID(ID)].showing = !Project.Layers.layers[getLayerIndexByID(ID)].showing;
        $("#" + Project.Layers.layers[getLayerIndexByID(ID)].ID).toggle();
    }

    function handleUpArrow(e, elem) {
        var ID = elem.id()[0];

        var index = getLayerIndexByID(ID);

        if (index === Project.Layers.layers.length - 1) {
            return;
        }
        Project.Editor.swapArrayElem(Project.Layers.layers, index, index + 1);
        updateLayers();
    }

    function handleDownArrow(e, elem) {
        var ID = elem.id()[0];

        var index = getLayerIndexByID(ID);

        if (index === 0) {
            return;
        }
        Project.Editor.swapArrayElem(Project.Layers.layers, index, index - 1);
        updateLayers();
    }

    // Rename

    window.Project.prototype.Layers = {
        selected: 'ID1-',
        selectedCanvas: null,
        selectedContext: null,
        Layer: class {
            ID = window.Project.Editor.genID();
            showing = true;
            constructor(name) {
                this.name = name;
                // Add canvas:
                this.canvas = $("<canvas>").className("layer-canvas").id(this.ID);

                this.ctx = this.canvas[0].getContext("2d");
            }
        },
        renameLayerConfirmed: function renameLayerConfirmed(input) {
            $("#" + Project.MessageBox.get("ID") + "N").text(input.name);
            Project.Layers.layers[getLayerIndexByID(Project.MessageBox.get("ID"))].name = input.name;
            Project.MessageBox.hide();
        },
        addLayer: function (input) {
            var name = input.name;

            // actual layer
            var newLayer = new Project.Layers.Layer(name);
            window.Project.Canvas.resizeCanvases([newLayer.canvas]);
            Project.Layers.layers.push(newLayer);
            updateLayers();
            setLayer(null, $("#" + newLayer.ID + "N"));
            Project.MessageBox.hide();
        },
        addLayerGUI: function () {
            Project.MessageBox.setMessage("NewLayer");
            Project.MessageBox.show();

        },

        getLayerByID: function (id) {
            return Project.Layers.layers[getLayerIndexByID(id)]
        },

        layers: []
    };

    //LOADER: add background
    $(window).load(function () {

        // adds first layer to project
        Project.Layers.addLayer({
            name: "Background"
        });
        
        // add a top canvas:
        var topCanvas = $("<canvas>").className("layer-canvas top-canvas").zIndex(-1);
        Project.Canvas.resizeCanvases([topCanvas]);
        $(".top-canvases").append(topCanvas);

        // add bottom canvas
        var bottomCanvas = $("<canvas>").className("layer-canvas bottom-canvas").zIndex(-1);
        Project.Canvas.resizeCanvases([bottomCanvas]);
        $(".bottom-canvases").append(bottomCanvas);

        // fill background of transparent bottom canvas
        var c = bottomCanvas[0].getContext("2d");
        c.fillStyle = "#fff";
        c.fillRect(0, 0, Project.Canvas.width, Project.Canvas.height);
    });
})(window);(function (window) {

    // cteate a button for the box
    function createButton(btn, inputs) {
        // what function to call
        var action = btn.action;

        // create the button, onclick
        var btnElem = $("<span>").className("msg-btn").text(btn.title).click(function () {
            // get inputs into object, name: value
            var inputObject = btn.args;

            // unknown what does this do???????
            $(".msg-input-value").map(function (l) {
                inputObject[l.name] = l.value;
            });
            window.Project.Editor.getPath(action)(inputObject);
        });

        // append the button to the messageBox
        $(".msg-btns").append(btnElem);
    }

    window.Project.prototype.MessageBox = {

        // alias for messageData? same thing?
        messageData: null,

        // set the message of the message box.
        setMessage: function setMessage(name) {

            // get the object for the message
            var message = Project.MessageBox.messageData[name];

            // change the title of the message box to the new title
            $(".msg-title").text(message.title);

            // set the content of the message to new content
            $(".msg-content").text(message.content);

            // clear the other buttons and inputs.
            $(".msg-btns").html("");
            $(".msg-inputs").html("");

            // create the inputs
            for (let i = 0; i < message.inputs.length; i++) {

                // array of inputs, for format look at the messages JSON file
                const input = message.inputs[i];
                var inputElem = $("<span>").className(".msg-input").text(input.content)
                    .append(
                        $("<input>").value(input.value).name(input.name).className("msg-input-value").type(input.type)
                    );
                $(".msg-inputs").append(inputElem);
            }

            for (let i = 0; i < message.buttons.length; i++) {
                createButton(message.buttons[i]);
            }
        },

        // get and set attributes for the message box. Idk why it is here, should not have a system here
        attrs: {},
        set: function (a, b) {
            this.attrs[a] = b;
        },
        get: function (a) {
            return this.attrs[a];
        },

        // hide the message box
        hide: function hide() {
            $(".outer-msg-box").hide();
        },
        // show the message box
        show: function show() {
            $(".outer-msg-box").show();
        },
    };

    // load all the avalible messages
    $(window).load(async function () {
        const response = await fetch('data/messageBox.json');
        const json = await response.json();
        window.Project.MessageBox.messageData = json;
    });
})(window);// handles mouse events
(function (window) {

    // last position
    var lastPos = [0, 0];

    // if the current brush has been initiated
    var inited = false;

    // the last brush mode used
    var lastMode = null;

    // create a new canvas for a new brush type
    function initCanvas(name) {
        var newCanvas = $("<canvas>");
        newCanvas.className(`layer-canvas ${name}-canvas`);
        Project.Canvas.resizeCanvases([newCanvas]);
        Project.Draw[name].canvas = newCanvas;
        Project.Draw[name].ctx = newCanvas[0].getContext("2d");
        $(".top-canvases").append(newCanvas);
    }

    // get the opt object when no event has occured
    function emulateOpts() {
        return handleMove(null);
    }

    // the mouse has moved, handle it appropriatly
    function handleMove(e) {

        // if the brush has not been initated yet, dont call its functions
        if (!inited) {
            return;
        }

        // get the current brush mode
        const mode = Project.Config.mode;

        // position of mouse
        var pos;
        // this function was called by emulateOpts(), there is no mouse position
        if (e === null) {
            pos = [null, null];
        } else {
            e.preventDefault();
            // top canvas is the canvas that is on top of everything else
            pos = Project.Editor.getMousePosition($(".top-canvas"), e);
        }

        // mouse positions
        var [a, b] = pos;
        var [c, d] = lastPos;

        // Options object
        var options = {
            pos: pos,
            canvas: Project.Layers.selectedCanvas,
            ctx: Project.Layers.selectedContext,
            topCtx: Project.Draw[mode].ctx,
            topCanvas: Project.Draw[mode].canvas,
            lastPos: lastPos,
            eventType: e === null ? null : e.type,
            deltaX: a - c,
            outOfBounds: true,
            deltaY: b - d,
            config: Project.Config
        };


        // Modes
        if (lastMode === null) {
            lastMode = mode;
        }
        if (mode != lastMode) {
            // init the brush
            options.topCtx = Project.Draw[lastMode].ctx;
            Project.Draw[lastMode].Deselect(options);

            lastMode = mode;
            options.topCtx = Project.Draw[mode].ctx;
            Project.Draw[mode].Init(options);
        }

        // called by emulateOpts()
        if (e === null) {
            return options;
        }
        
        // update the modes top canvas
        Project.Draw[mode].Top(options);
        // the selected layer is not showing, dont edit it
        if (!Project.Layers.getLayerByID(Project.Layers.selected).showing) {
            // show warning
            console.log("L");
            return;
        } else {
            // show warning

        }
        if (Project.Canvas.mousedown) {
            if (e.type === "mousedown") {
                Project.Draw[mode].Down(options);

            } else if (e.type === "mouseup") {
                Project.Draw[mode].Up(options);

            } else if (e.type === "mousemove") {
                Project.Draw[mode].Move(options);
            }
        }

        lastPos = pos;
    }
    // initiate the Project.Draw object
    Project.prototype.Draw = {};
    
    // initiate the drawing events
    Project.prototype.Draw.Init = async function () {

        // handle mousedown with a click
        $(".top-canvas").mousedown(function (e) {
            Project.Canvas.mousedown = true;
            handleMove(e);
        });

        // disable right clicking
        $(".content").on("contextMenu", function (e) {
            e.preventDefault();
        })

        // handle a mousemove, but with no click
        $(window).mousemove(handleMove);

        // handle mousemove & user let go of click
        $(window).mouseup(function (e) {
            handleMove(e);
            Project.Canvas.mousedown = false;
        });

        // init new canvases for each brush mode
        const response = await fetch("data/modes.json");
        const json = await response.json();

        for (let i = 0; i < json.length; i++) {
            const name = json[i];
            initCanvas(name);
        }

        // so it can be called from other functions
        Project.Draw.emulateDraw = emulateOpts;


        // the drawing is ready for user input
        inited = true;
    }



    // drawing specific functions:

    // restore a canvas and everything else
    Project.prototype.Draw.restore = function () {
        Project.Layers.selectedContext.restore();
        Project.Draw.drawCtx.restore();
        Project.Draw.Select.selected = false;
        Project.Draw.clear(Project.Draw["Select"].ctx);
    };
    // clear a ctx
    Project.prototype.Draw.clear = function (ctx) {
        // assumes canvas is width and height of the project
        ctx.clearRect(0, 0, Project.Canvas.width, Project.Canvas.height);
    };
    // clip
    Project.prototype.Draw.clip = function (ctx) {
        // only clip the selected region
        if (Project.Draw.Select.selected) {
            ctx.save();

            // assuming rect selection, will change later TODO:
            ctx.rect(...Project.Draw.Select.topPos, Project.Draw.Select.bottomPos[0] - Project.Draw.Select.topPos[0], Project.Draw.Select.bottomPos[1] - Project.Draw.Select.topPos[1]);
            ctx.clip();
        }
    };


    // initiate the canvases:

    
    $(window).load(function () {

        // Drawing Canvas
        // drawing canvas is for previewing things when it cannot be 
        var drawCanv = $("<canvas>").width(Project.Canvas.width).height(Project.Canvas.height);
        drawCanv.className("draw-canvas layer-canvas");
        drawCanv.zIndex(59);
        Project.Draw.drawCanv = drawCanv;
        Project.Draw.drawCtx = drawCanv[0].getContext("2d");

        $(".draw-canvases").append(drawCanv);
        window.Project.Canvas.resizeCanvases([drawCanv]);

        // init drawing
        Project.Draw.Init();
    });
})(window);(function (window) {
    window.Project.prototype.Config = {
        // default mode
        mode: "Pen",

        // box selection
        selected: {
            from: [0, 0],
            // Value 
            to: [0, 0]
        },

        // lineWidth/size:
        size: 8,
        
        // the miterLimit for strokes
        miterLimit: 10,

        // to make the brush look rounded
        lineCap: "round",
        lineJoin: "round",

        // white
        color: "#000",

        // the opacity for drawings
        strokeOpacity: 100,
        fillOpacity: 100,

        // shadow settings:
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: "#000",

        // ?
        connectPoints: true,

        // for modules to make their own values
        set: function (opt, val) {
            this[opt] = val;
        }
    };
})(window);/* /toolbar.js */
(function (window) {
    // create the toolbar for the interface
    // data is the JSON object parsed
    function createToolbar(data) {
        // the parent is the element above
        var parent = $("<div>").className("nav-menu");

        // loop through data
        for (let i = 0; i < data.length; i++) {
            
            // the attributes for a menu
            const {
                type, // button, dropdown, or link
                name,
            } = data[i];


            if (type === "button") {
                var elem = $("<span>").html(name).className("nav-button").click(function (e) {
                    // when button is clicked execute the function 
                    data[i]["action"].split('.').reduce((o, i) => o[i], window)();
                });
                parent.append(elem);
            
            } else if (type === "dropdown") {
                var elem = $("<div>").html(name).className("nav-dropdown");
                // recursive and create a menu within the mnenu
                elem.append(createToolbar(data[i].content));
                parent.append(elem);
            
            } else if (type === "link") {
                // hyperlink
                var elem = $("<a>");
                elem.href(data[i].href)
                elem.className("nav-button")
                elem.html(name);
                elem.color("white");
                elem.style("float", "right");
                parent.append(elem);
            } 
        }
        return parent;
    }

    // load the toolbar
    $(window).load(async function () {
        const response = await fetch("data/toolbar.json");
        const json = await response.json();
        $(".nav-bar").append(createToolbar(json));
    });

    // if you want to expand the toolbar, append the results of createToolbar with your object to $(".nav-bar")
})(window);