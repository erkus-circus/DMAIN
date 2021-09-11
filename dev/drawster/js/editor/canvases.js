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
})(window);