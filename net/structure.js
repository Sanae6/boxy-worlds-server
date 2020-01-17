const fs = require('fs')
const readline = require("readline");
const Box = require("./box");

const tilesetShift = 5;//how many tiles preceed the dungeon tileset

class Structure{
    constructor(file,threshold){
        let bwrom = readline.createInterface(fs.createReadStream(__dirname+"/structures/"+file+".bwrom"));
        let joe = await line;
        if (joe != "Joe") throw new Error("File \""+file+".bwrom\" has invalid header (Joe header)");
        let w = await line;
        let h = await line;
        /**
         * @name boxes
         * @type {Array<Box>}
         */
        this.boxes = [];
        let i = 0;
        let isWall = false;
        for (let x=0;x<w;x++)for(let y=0;y<h;y++){
            if (isWall) this.boxes[16*x+y].wall = line == "1";
            else this.boxes[16*x+y] = new Box(parseInt(line)+tilesetShift,x,y,line == 1);
        }
    }
}
module.exports = Structure