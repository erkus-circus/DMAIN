(function (window) {
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
})(window);