// handles mouse events
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
})(window);