/* penDraw.js */
(function (window) {
    // alternate color of selector
    var alternating = true;

    Project.prototype.Draw.Pen = {};
    Project.prototype.Draw.Pen.Deselect = function (opts) {
        opts.ctx.restore();
        opts.topCtx.clearRect(0, 0, Project.Canvas.width, Project.Canvas.height);
    };
    Project.prototype.Draw.Pen.Top = function (opts) {
        alternating = !alternating;
        
        var tc = opts.topCtx;
        tc.clearRect(0, 0, Project.Canvas.width, Project.Canvas.height);
        tc.beginPath();
        tc.arc(opts.pos[0], opts.pos[1], opts.config.size / 2, 0, 2 * Math.PI);
        tc.stroke();
        tc.beginPath();
        tc.shadowBlur = .01;
        tc.shadowColor = "#fff"
        tc.arc(opts.pos[0], opts.pos[1], 1, 0, 2 * Math.PI);
        tc.fill();

    }
    Project.prototype.Draw.Pen.Move = function (opts) {
        var c = opts.ctx;
        var dc = Project.Draw.drawCtx;
        var config = opts.config;



        // LAYER:DRAW
        // Config
        c.lineWidth = config.size;
        c.shadowColor = config.shadowColor;
        c.shadowBlur = config.shadowBlur;
        c.globalAlpha = config.strokeOpacity / 100;
        c.shadowOffsetX = config.shadowOffsetX;
        c.shadowOffsetY = config.shadowOffsetY;
        c.lineCap = opts.config.lineCap;
        c.lineJoin = opts.config.lineJoin;

        c.strokeStyle = config.color;
        // Draw
        c.moveTo(...opts.lastPos);

        c.lineTo(...opts.pos);



        // LAYER:DRAW
        // Config
        dc.beginPath();
        dc.lineWidth = config.size;
        dc.shadowColor = config.shadowColor;
        dc.shadowBlur = config.shadowBlur;
        dc.globalAlpha = config.strokeOpacity / 100;
        dc.shadowOffsetX = config.shadowOffsetX;
        dc.shadowOffsetY = config.shadowOffsetY;
        dc.lineCap = opts.config.lineCap;
        dc.lineJoin = opts.config.lineJoin;

        dc.strokeStyle = config.color;
        // Draw
        dc.moveTo(...opts.pos);

        if (config.connectPoints) {
            dc.moveTo(...opts.lastPos);
        }
        dc.lineTo(...opts.pos);
        dc.stroke();
    };

    Project.prototype.Draw.Pen.Up = function (opts) {
        opts.topCtx.clearRect(0, 0, Project.Canvas.width, Project.Canvas.height);
        Project.Draw.drawCtx.clearRect(0, 0, Project.Canvas.width, Project.Canvas.height);

        var c = opts.ctx;
        c.stroke();
        c.closePath();
        c.restore();
        Project.Draw.drawCtx.restore();
    };
    Project.prototype.Draw.Pen.Down = function (opts) {
        var c = opts.ctx;

        Project.Draw.clip(c);
        Project.Draw.clip(Project.Draw.drawCtx);
        c.beginPath();

        this.Move(opts);
    };
    Project.prototype.Draw.Pen.Init = function (opts) {}
})(window);