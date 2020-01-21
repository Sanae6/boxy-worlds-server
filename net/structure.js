const fs = require('fs')
const RL = require("n-readlines");
const Box = require("./box");

const tilesetShift = 5;//how many tiles preceed the dungeon tileset

/**
 * 
 * @param {RL} lr 
 */
function getLine(lr){
    let b = lr.next();
    return b.slice(0,b.length-1).toString();
}

class Structure{
    constructor(file){
        let bwrom = new RL(__dirname+"\\..\\structures\\"+file+".bwrom");
        let joe = getLine(bwrom);
        if (joe != "Joe") throw new Error("File \""+file+".bwrom\" has invalid header (Joe != "+joe+")");
        let w = parseInt(getLine(bwrom));
        let h = parseInt(getLine(bwrom));
        this.sx = 0;
        this.sy = 0;
        this.file = file;
        /**
         * @name boxes
         * row [ column [ box ] ]
         * @type {Array<Array<Box>>}
         */
        this.boxes = [];
        let i = 0;
        let box,wall;
        for (let y=0;y<h;y++){
            let br = [];
            for(let x=0;x<w;x++){
                box = getLine(bwrom);
                wall = getLine(bwrom)
                let id = parseInt(box);
                if (id != -1) id += tilesetShift;
                br[x] = new Box(id,x,y,wall == "1");
            }
            this.boxes.push(br);
        }
        //begin cropping the unused rows and columns - dream todo: save the cropped bwrom files, but that won't happen before we have to hand this in
        for (let r=0;r<h;r++){
            let re = false;
            for(let x=0;x<w;x++){
                if (!re && this.boxes[r][x].id != -1){
                    re = true;
                }
            }
            if (!re){
                this.boxes.splice(r,1);
                h--;
                r--;
            }
        }
        for (let c=0;c<w;c++){
            let ce = false;
            let s = "column "+c+" boxids ";
            for(let y=0;y<h;y++){
                if (this.boxes[y][c].id != -1){
                    ce = true;
                }
                s+= this.boxes[y][c].id;
                if (y != h-1) s+=", ";
            }
            if (ce){
                //console.log(s);
            }else {
                //console.log(c);
                for(let y=0;y<h;y++){
                    this.boxes[y].splice(c,1);
                }
                w--;//decrement the width
                c--;//don't skip columns
            }
        }
        this.w = w;
        this.h = h;
    }
    setPos(x,y){
        this.sx = x;
        this.sy = y;
    }
    getBox(x,y){
        let b = this.boxes[y][x].copy();
        b.x = this.sx+y;
        b.y = this.sy+y;
        return b;
    }
}
module.exports = Structure