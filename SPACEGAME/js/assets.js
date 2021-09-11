
function Camera(w, h,x=0,y=0) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
}

function Tile(x,y,pos,collide=false,src="basic-text") {
    this.x = x;
    this.y = y;
    this.src = src;
    this.pos = pos
    this.collide = collide;
}

function Map(name, s = 16) {
    this.name = name;
    // size of each tile
    this.size = s;
    this.x = 0;
    this.y = 0;
    this.map = []
    this.generate = function () {
        this.map = []

        var mmaapp = {...{},...maps[this.name]};
        this.rows = mmaapp.height;
        this.cols = mmaapp.width;
        mmaapp = mmaapp.map;

        for (let y = 0; y < mmaapp.length; y++) {
            for (let x = 0; x < mmaapp[0].length; x++) {
                var curTile = [];
                for (let i = 0; i < mmaapp[y][x].length; i++) {
                    var t = mmaapp[y][x][i];
                    
                    switch (t) {
                        case -1:
                            curTile.push(new Tile(0,0,[x,y],true,"blank")) // blank
                            break
                        case 0:
                            curTile.push(new Tile(0,0,[x,y],true)) // rock
                            break;
                        case 1:
                            curTile.push(new Tile(1, 0,[x,y])) // grass
                            break
                        case 2:
                            curTile.push(new Tile(0, 1,[x,y], true)); // water
                            break
                        case 3:
                            curTile.push(new Tile(1,1,[x,y],true)) // tree
                            break;
                        case 4:
                            curTile.push(new Tile(2,1,[x,y])); // gravel path
                            break;
                        case 5:
                            curTile.push(new Tile(2,0,[x,y])); // passage
                            break;
                        case 6:
                            curTile.push(new Tile(0,0,[x,y],1,"sword")); // sword
                            break;
                        case 7:
                            console.log(x,y);
                            
                            curTile.push(new Tile(1,0,[x,y],1,"sword")) // forward sword
                        default:
                            curTile.push(t);
                            break;
                    }
                }
                mmaapp[y][x] = curTile;
            }
        }
        this.map = mmaapp;
    }

    this.get = function (x, y) {
        x = Math.round(x)
        y = Math.round(y)
        try {
            return this.map[y][x];
        } catch (e) {
            return null;
        }
    }
    this.update = function (c, camr) {
        var startCol = 0,
            startRow = 0,

            endCol = Math.round((camr.width - camr.x) / this.size) + 1,
            endRow = Math.round((camr.height - camr.y) / this.size) + 1;

        if (camr.x >= 0) {
            startCol = 0
        } else {
            startCol = Math.round(-(camr.width + camr.x) / this.size);
        }

        if (camr.y >= 0) {
            startRow = 0;
        } else {
            startRow = Math.round(-(camr.height + camr.y) / this.size);
        }
        collidable = []
        for (let y = startRow; y < endRow; y++) {
            // some logic is inside here and that is why this is update and not render.
            if (y >= this.rows) {
                break;
            }
            for (let x = startCol; x < endCol; x++) {
                if (x >= this.cols || this.get(x, y) === null) {
                    break;
                }
                //c.fillRect(x * this.size + camr.x, y * this.size + camr.y, this.size, this.size);
                c.beginPath();
                
                var ctile = this.get(x,y);

                if (typeof ctile === "undefined") {
                    continue;
                }

                for (let i = 0; i < ctile.length; i++) {
                    var tile = ctile[i];
                    
                    try {
                        c.drawImage($("#" + tile.src)[0], tile.x * this.size, tile.y * this.size, this.size, this.size,
                            x * this.size + camr.x, y * this.size + camr.y, this.size, this.size);
                    } catch (e) {}

                    c.closePath();
                    
                    if (tile.collide) {
                        collidable.push(tile)
                    }
                }
            }
        }
    }
}

function Player(x,y,type=null,src,width=null,height=null) {
    this.type = type;
    this.src = src;
    this.width = width;
    this.height = height;
    if (type != null && this.width === null) {
        this.width = $("#" + src).width();
    }
    if (type !=null && this.height === null) {
        this.height = $("#" + src).height();
    }
    this.x = x;
    this.y = y;
    this.movable = 1;
    this.frame = 0;
    this.moving = 0;
    this.upSpeed;
    this.getPosRelToCam = function (cam) {
        return [
            this.x - cam.x,
            this.y - cam.y
        ];
    }

    this.getPosRelToCamSize = function (cam,size) {
        var [x,y] = this.getPosRelToCam(cam)
        return [x / size, y / size];
    }
    this.update = function (c) {
        
        if (type === null) {
            c.beginPath();
            c.fillStyle = "#000";
            c.fillRect(this.x,this.y,s,s);
            c.closePath();
        } else if (type === "char") {
            c.beginPath();

            c.drawImage($("#" + this.src)[0],
                this.x,
                this.y);
            
            c.closePath();
            this.frame++;
        }
    }
}