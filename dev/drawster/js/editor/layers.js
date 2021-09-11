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
})(window);