var gamePlay = {
    weapons: {},
    enemies: [],
    inventory: {},
    health: 3
};
var oldMan;
function LVL_first() {
    var [x,y] = player.getPosRelToCamSize(cam,s);
    if (Math.round(y) == 0 && (Math.round(x) == 6 || Math.round(x) == 7)) {
        cam.y -= map.rows*s-s*2;
        map.name = "cave_1";
        map.generate("cave_1")
    }

    if ("sword" in gamePlay.weapons) {
        maps["first"].map[7][13] = [4];
        maps["first"].map[8][13] = [4];
        map.generate();
        if (Math.round(x) == 13 && (Math.round(y) == 7 || Math.round(y) == 8)) {
            map.name = "main_map";
            map.generate();
        }
    }
}
//sword 8,8
function LVL_cave_1() {
    var [x, y] = player.getPosRelToCamSize(cam, s);
    var px = Math.round(x),
        py = Math.round(y);

    if (Math.round(y) == 14 && (Math.round(x) == 6 || Math.round(x) == 7)) {
        map.name = "first";
        cam.y += map.rows * s - s * 2;
        map.generate("first");
    }
    
    player.movable = 0;
    if (oldMan.frame > 60*5) {
        c.globalAlpha = 150 / oldMan.frame;
        player.movable = 1;
        gamePlay.weapons.sword = 5;
        if (c.globalAlpha <= 0) {
            c.globalAlpha = 1;
        }
    } else if (player.getPosRelToCamSize(cam,s)[1] > 10) {
        cam.y += .5;
    }
    oldMan.update(c);
    c.beginPath();
    var txt = "Here! Take this sword. you will need it out there. Press Z to attack";
    c.font = "7px Arial"
    var w  = c.measureText(txt).width;
    c.lineWidth = 1
    c.strokeText(txt, oldMan.x - w/2+(s*2/1.5)+7, oldMan.y + 10*s/2);
    c.closePath();
    
    oldMan.x = cam.x - map.cols*-1*3;
    oldMan.y = cam.y - map.rows * -1 * 2.5;
    c.globalAlpha = 1;
}

function initGame() {
    oldMan = new Player(map.cols, map.rows, "char","oldman");
}

function game() {
    var n = map.name
    if (n == "first") {
        LVL_first()
    } else if (n == "cave_1") {
        LVL_cave_1()
    }
}

function gameKey(kc) {
    if (kc == 90) {
        // Z: attack
        
    }
}