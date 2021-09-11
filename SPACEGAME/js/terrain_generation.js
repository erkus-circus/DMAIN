function getBlockType(n) {
    if (n < .1) return 2;

    if(n < .55) return 3;

    return 1;
}

function generateTerrain(w,h) {
    var map = [];
    var rarity = .1
    for (let y = 0; y < h; y++) {
        var tmap = []
        for (let x = 0; x < w; x++) {
            var n = perlin.get(x, y);
            // console.log(x,y,n);
            console.log(n);
            
            tmap.push([getBlockType(n)]);
        }
        map.push(tmap)
    }

    return {
        width: w,
        height: h,
        map: map
    };
}

function genNew() {
    maps.m = generateTerrain(100, 100);
    console.log("NOISE GENERATION COMLETE");
    
    map.name = "m";
    map.generate();
    console.log("MAP GENERATION COMLETE");
}

