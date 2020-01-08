const Chunk = require("./chunk");
const Box = require("./box");
const Provider = require("./provider");
const {mkdirSync,writeFile,readFile,existsSync} = require("fs");
/**
 * @returns {Box}
 * @param {number} cx 
 * @param {number} cy 
 * @param {number} x 
 * @param {number} y 
 */
function perlin(cx,cy,x,y){
    let height = noise.perlin2((cx*16+x)/100,(cy*16+y)/100);
    if (height < -0.1) return new Box(3,x,y,false);
    if (height > -0.1 && height < 0.1) return new Box(0,x,y,false);
    return new Box(1,x,y,(isEven(x) && !isEven(y))||(isEven(y) && !isEven(x)))
}
class MapProvider extends Provider{
    constructor(name){
        super();
        if (!existsSync(`worlds/${name}`)){
            mkdirSync(`worlds/${name}`);
        }
        this.generate();
    }
    generate(){
        
        for(var cx=-10;cx<10;cx++)for(var cy=-10;cy<10;cy++){
            if (this.hasChunk())
            perlin()
        }
    }
    hasChunk(x,y,z){

    }
}